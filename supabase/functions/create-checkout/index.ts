import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, course_id }: { 
      name: string; 
      email: string; 
      phone: string; 
      course_id: string;
    } = await req.json();

    console.log("Creating checkout session for:", { email, course_id });

    // Validate required fields
    if (!email || !course_id) {
      throw new Error("Email and course_id are required");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create Supabase client to get course info
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get course info to validate
    const { data: course, error: courseError } = await supabaseClient
      .from("courses")
      .select("id, title, price_cents")
      .eq("id", course_id)
      .eq("is_active", true)
      .single();

    if (courseError || !course) {
      console.error("Course not found:", courseError);
      throw new Error("Course not found or inactive");
    }

    console.log("Course found:", course.title);

    // Check if a Stripe customer already exists for this email
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string | undefined;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Existing Stripe customer found:", customerId);
    } else {
      // Create a new customer
      const newCustomer = await stripe.customers.create({
        email,
        name,
        phone,
        metadata: {
          source: "formacao_closer",
        },
      });
      customerId = newCustomer.id;
      console.log("New Stripe customer created:", customerId);
    }

    // Get the origin for redirect URLs
    const origin = req.headers.get("origin") || "https://kpxdglccqxkudlasexki.lovableproject.com";

    // Create checkout session with Pix, Boleto and card installments
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: "price_1SjsfvR9LilCIYmYGGTYspCM", // R$ 197,00
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_method_types: ["card", "pix", "boleto"],
      payment_method_options: {
        card: {
          installments: {
            enabled: true,
          },
        },
        boleto: {
          expires_after_days: 3,
        },
      },
      locale: "pt-BR",
      success_url: `${origin}/pagamento-sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pagamento-cancelado`,
      metadata: {
        course_id,
        name,
        email,
        phone,
      },
      payment_intent_data: {
        metadata: {
          course_id,
          name,
          email,
          phone,
        },
      },
    });

    console.log("Checkout session created:", session.id);

    // Update abandoned cart step
    await supabaseClient
      .from("abandoned_carts")
      .update({ checkout_step: "checkout_initiated" })
      .eq("email", email)
      .eq("course_id", course_id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
