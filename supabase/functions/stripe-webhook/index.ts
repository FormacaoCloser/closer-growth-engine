import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
};

const getWelcomeEmailHtml = (
  name: string,
  courseName: string,
  amount: string,
  email: string,
  password: string,
  platformUrl: string
): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Bem-vindo!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Sua compra foi confirmada com sucesso</p>
    </div>
    
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Olá <strong>${name}</strong>,
      </p>
      
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Parabéns pela sua decisão! Seu pagamento de <strong>${amount}</strong> foi confirmado e você agora tem acesso ao curso:
      </p>
      
      <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
        <p style="color: #166534; font-size: 18px; font-weight: 600; margin: 0;">📚 ${courseName}</p>
      </div>
      
      <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h3 style="color: #92400e; margin: 0 0 16px 0; font-size: 16px; text-align: center;">🔐 Suas Credenciais de Acesso</h3>
        <div style="background: white; border-radius: 8px; padding: 16px;">
          <p style="margin: 0 0 12px 0; color: #374151;">
            <strong>Email:</strong><br>
            <span style="color: #059669; font-family: monospace; font-size: 15px;">${email}</span>
          </p>
          <p style="margin: 0; color: #374151;">
            <strong>Senha provisória:</strong><br>
            <span style="color: #059669; font-family: monospace; font-size: 15px; background: #f0fdf4; padding: 4px 8px; border-radius: 4px;">${password}</span>
          </p>
        </div>
      </div>
      
      <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #991b1b; font-size: 14px; margin: 0;">
          ⚠️ <strong>Importante:</strong> Recomendamos que você altere sua senha após o primeiro acesso para maior segurança.
        </p>
      </div>
      
      <h3 style="color: #374151; font-size: 16px; margin: 0 0 16px 0;">📋 Como acessar:</h3>
      <ol style="color: #6b7280; font-size: 14px; line-height: 1.8; margin: 0 0 24px 0; padding-left: 20px;">
        <li>Clique no botão abaixo para acessar a plataforma</li>
        <li>Faça login com o email e senha acima</li>
        <li>Altere sua senha nas configurações</li>
        <li>Comece seus estudos!</li>
      </ol>
      
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${platformUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Acessar Plataforma →
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
      
      <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">
        Bons estudos! 🚀<br>
        Estamos aqui para ajudar no que precisar.
      </p>
    </div>
  </div>
</body>
</html>
`;

const getExistingUserEmailHtml = (
  name: string,
  courseName: string,
  amount: string,
  platformUrl: string
): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Compra Confirmada!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Novo curso adicionado à sua conta</p>
    </div>
    
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Olá <strong>${name}</strong>,
      </p>
      
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Seu pagamento de <strong>${amount}</strong> foi confirmado! O curso foi adicionado à sua conta:
      </p>
      
      <div style="background: #eff6ff; border: 1px solid #93c5fd; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
        <p style="color: #1e40af; font-size: 18px; font-weight: 600; margin: 0;">📚 ${courseName}</p>
      </div>
      
      <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #166534; font-size: 14px; margin: 0;">
          💡 <strong>Dica:</strong> Acesse a plataforma com seu email e senha já cadastrados para começar a estudar.
        </p>
      </div>
      
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${platformUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Acessar Plataforma →
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
      
      <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">
        Bons estudos! 🚀<br>
        Estamos aqui para ajudar no que precisar.
      </p>
    </div>
  </div>
</body>
</html>
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

      // 8. Fetch course name for email
      const { data: courseData } = await supabaseAdmin
        .from("courses")
        .select("title")
        .eq("id", course_id)
        .single();

      const courseName = courseData?.title || "seu curso";
      const amount = formatCurrency(session.amount_total || 0);
      const platformUrl = `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovableproject.com')}/auth` || "https://kpxdglccqxkudlasexki.lovableproject.com/auth";

      // 9. Send welcome email
      try {
        if (tempPassword) {
          // New user - send credentials
          const html = getWelcomeEmailHtml(
            name || "Aluno",
            courseName,
            amount,
            email,
            tempPassword,
            platformUrl
          );
          
          const { error: emailError } = await resend.emails.send({
            from: "Notificações <onboarding@resend.dev>",
            to: [email],
            subject: `🎉 Bem-vindo! Seu acesso ao ${courseName}`,
            html,
          });

          if (emailError) {
            console.error("Error sending welcome email:", emailError);
          } else {
            console.log("Welcome email with credentials sent to:", email);
          }
        } else {
          // Existing user - just confirm purchase
          const html = getExistingUserEmailHtml(
            name || "Aluno",
            courseName,
            amount,
            platformUrl
          );
          
          const { error: emailError } = await resend.emails.send({
            from: "Notificações <onboarding@resend.dev>",
            to: [email],
            subject: `✅ Compra Confirmada! ${courseName} liberado`,
            html,
          });

          if (emailError) {
            console.error("Error sending confirmation email:", emailError);
          } else {
            console.log("Purchase confirmation email sent to:", email);
          }
        }
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr);
        // Don't fail the webhook if email fails
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
