import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, course_id, payment_method } = await req.json();
    
    console.log("Creating payment intent for:", { email, course_id, payment_method });

    if (!email || !course_id) {
      return new Response(
        JSON.stringify({ error: "Email e course_id são obrigatórios" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get course info
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, price_cents, max_installments")
      .eq("id", course_id)
      .eq("is_active", true)
      .single();

    if (courseError || !course) {
      console.error("Course error:", courseError);
      return new Response(
        JSON.stringify({ error: "Curso não encontrado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    console.log("Course found:", course.title, "Price:", course.price_cents);

    // Check/create Stripe customer
    let customerId: string | undefined;
    const customers = await stripe.customers.list({ email: email, limit: 1 });
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Existing customer found:", customerId);
    } else {
      const customer = await stripe.customers.create({
        email: email,
        name: name,
        phone: phone,
        metadata: { source: "checkout_transparente" }
      });
      customerId = customer.id;
      console.log("New customer created:", customerId);
    }

    // Determine payment method types
    const paymentMethodTypes: string[] = [];
    if (payment_method === "card" || !payment_method) {
      paymentMethodTypes.push("card");
    }
    if (payment_method === "boleto") {
      paymentMethodTypes.push("boleto");
    }
    if (!payment_method) {
      paymentMethodTypes.push("boleto");
    }

    // Create PaymentIntent
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: course.price_cents,
      currency: "brl",
      customer: customerId,
      payment_method_types: paymentMethodTypes,
      metadata: {
        course_id: course.id,
        course_title: course.title,
        name: name,
        email: email,
        phone: phone || "",
      },
    };

    // Add payment method options
    if (paymentMethodTypes.includes("card")) {
      paymentIntentParams.payment_method_options = {
        ...paymentIntentParams.payment_method_options,
        card: {
          installments: {
            enabled: true,
          },
        },
      };
    }

    if (paymentMethodTypes.includes("boleto")) {
      paymentIntentParams.payment_method_options = {
        ...paymentIntentParams.payment_method_options,
        boleto: {
          expires_after_days: 3,
        },
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
    console.log("PaymentIntent created:", paymentIntent.id);

    // Update abandoned cart
    await supabase
      .from("abandoned_carts")
      .update({ checkout_step: "payment_intent_created" })
      .eq("email", email)
      .eq("course_id", course_id);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: course.price_cents,
        courseName: course.title,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: unknown) {
    console.error("Error creating payment intent:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
