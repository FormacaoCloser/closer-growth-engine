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

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  // Create Supabase admin client with service role key
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    console.error("Missing signature or webhook secret");
    return new Response(
      JSON.stringify({ error: "Missing signature or webhook secret" }),
      { status: 400, headers: corsHeaders }
    );
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log("Webhook event received:", event.type);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", errMessage);
    return new Response(
      JSON.stringify({ error: `Webhook Error: ${errMessage}` }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Handle checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    console.log("Processing checkout.session.completed:", session.id);
    console.log("Session metadata:", session.metadata);

    const { course_id, name, email, phone } = session.metadata || {};

    if (!email || !course_id) {
      console.error("Missing email or course_id in metadata");
      return new Response(
        JSON.stringify({ error: "Missing required metadata" }),
        { status: 400, headers: corsHeaders }
      );
    }

    try {
      // 1. Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === email);

      let userId: string;
      let tempPassword: string | null = null;

      if (existingUser) {
        userId = existingUser.id;
        console.log("Existing user found:", userId);
      } else {
        // 2. Create new user with temporary password
        tempPassword = Math.random().toString(36).slice(-8) + "A1!";
        
        const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: name,
            phone,
          },
        });

        if (createUserError || !newUser.user) {
          console.error("Error creating user:", createUserError);
          throw new Error("Failed to create user account");
        }

        userId = newUser.user.id;
        console.log("New user created:", userId);

        // 3. Assign student role
        const { error: roleError } = await supabaseAdmin
          .from("user_roles")
          .insert({
            user_id: userId,
            role: "student",
          });

        if (roleError) {
          console.error("Error assigning role:", roleError);
        }
      }

      // 4. Create order record
      const { error: orderError } = await supabaseAdmin
        .from("orders")
        .insert({
          user_id: userId,
          course_id,
          amount_cents: session.amount_total || 149700,
          status: "paid",
          paid_at: new Date().toISOString(),
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
        });

      if (orderError) {
        console.error("Error creating order:", orderError);
      } else {
        console.log("Order created successfully");
      }

      // 5. Create enrollment
      const { error: enrollmentError } = await supabaseAdmin
        .from("enrollments")
        .insert({
          user_id: userId,
          course_id,
          status: "active",
        });

      if (enrollmentError) {
        console.error("Error creating enrollment:", enrollmentError);
      } else {
        console.log("Enrollment created successfully");
      }

      // 6. Update lead as converted
      const { error: leadError } = await supabaseAdmin
        .from("leads")
        .update({
          converted_at: new Date().toISOString(),
        })
        .eq("email", email);

      if (leadError) {
        console.error("Error updating lead:", leadError);
      }

      // 7. Update abandoned cart as recovered
      const { error: cartError } = await supabaseAdmin
        .from("abandoned_carts")
        .update({
          recovered: true,
          checkout_step: "payment_completed",
        })
        .eq("email", email)
        .eq("course_id", course_id);

      if (cartError) {
        console.error("Error updating abandoned cart:", cartError);
      }

      console.log("Webhook processing completed successfully");

      return new Response(
        JSON.stringify({ 
          success: true, 
          userId,
          message: "Payment processed successfully" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error processing payment:", error);
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: corsHeaders }
      );
    }
  }

  // Return 200 for unhandled events
  console.log("Unhandled event type:", event.type);
  return new Response(
    JSON.stringify({ received: true }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
