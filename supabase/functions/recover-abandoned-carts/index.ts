import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    console.log("Starting abandoned cart recovery process...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get base URL from request or use default
    const { baseUrl } = await req.json().catch(() => ({}));
    const siteUrl = baseUrl || "https://kpxdglccqxkudlasexki.lovableproject.com";

    // Find abandoned carts that:
    // - Haven't been recovered
    // - Haven't had a recovery email sent
    // - Were created more than 1 hour ago
    // - Limit to 50 per execution to avoid overload
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: abandonedCarts, error: cartsError } = await supabase
      .from("abandoned_carts")
      .select(`
        id,
        email,
        course_id,
        checkout_step,
        created_at
      `)
      .eq("recovered", false)
      .eq("recovery_email_sent", false)
      .lt("created_at", oneHourAgo)
      .limit(50);

    if (cartsError) {
      console.error("Error fetching abandoned carts:", cartsError);
      throw cartsError;
    }

    console.log(`Found ${abandonedCarts?.length || 0} abandoned carts to process`);

    if (!abandonedCarts || abandonedCarts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No abandoned carts to process",
          emailsSent: 0 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let emailsSent = 0;
    let errors: string[] = [];

    for (const cart of abandonedCarts) {
      try {
        console.log(`Processing cart ${cart.id} for email ${cart.email}`);

        // Get lead info for personalization
        const { data: lead } = await supabase
          .from("leads")
          .select("name, phone")
          .eq("email", cart.email)
          .single();

        const customerName = lead?.name || "Aluno";

        // Get course info if available
        let courseName = "nosso curso";
        let coursePrice = "";
        
        if (cart.course_id) {
          const { data: course } = await supabase
            .from("courses")
            .select("title, price_cents, max_installments")
            .eq("id", cart.course_id)
            .single();

          if (course) {
            courseName = course.title;
            const priceFormatted = (course.price_cents / 100).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            });
            const installments = course.max_installments || 12;
            const installmentValue = (course.price_cents / 100 / installments).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            });
            coursePrice = `${priceFormatted} ou ${installments}x de ${installmentValue}`;
          }
        }

        // Generate checkout link with pre-filled email
        const checkoutLink = `${siteUrl}/?email=${encodeURIComponent(cart.email)}&checkout=true`;

        // Send recovery email
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">
                  🛒 Você deixou algo para trás!
                </h1>
              </div>
              
              <div style="background-color: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <p style="color: #374151; font-size: 18px; line-height: 1.6; margin-bottom: 20px;">
                  Olá <strong>${customerName}</strong>,
                </p>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  Notamos que você se interessou pelo curso <strong style="color: #7c3aed;">${courseName}</strong> mas não finalizou sua matrícula.
                </p>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  Sua vaga ainda está reservada, mas não por muito tempo! ⏰
                </p>
                
                ${coursePrice ? `
                <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
                  <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">Valor do investimento:</p>
                  <p style="color: #7c3aed; margin: 0; font-size: 22px; font-weight: bold;">${coursePrice}</p>
                </div>
                ` : ''}
                
                <div style="text-align: center; margin: 35px 0;">
                  <a href="${checkoutLink}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 30px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);">
                    Finalizar Matrícula →
                  </a>
                </div>
                
                <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 30px;">
                  Caso não tenha sido você, por favor ignore este email.
                </p>
              </div>
              
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
                Você está recebendo este email porque iniciou uma matrícula em nosso site.
              </p>
            </div>
          </body>
          </html>
        `;

        const emailResponse = await resend.emails.send({
          from: "Escola Online <onboarding@resend.dev>",
          to: [cart.email],
          subject: `${customerName}, sua vaga está reservada! 🎓`,
          html: emailHtml,
        });

        console.log(`Recovery email sent to ${cart.email}:`, emailResponse);

        // Update cart to mark email as sent
        const { error: updateError } = await supabase
          .from("abandoned_carts")
          .update({
            recovery_email_sent: true,
            recovery_email_sent_at: new Date().toISOString(),
          })
          .eq("id", cart.id);

        if (updateError) {
          console.error(`Error updating cart ${cart.id}:`, updateError);
          errors.push(`Failed to update cart ${cart.id}: ${updateError.message}`);
        } else {
          emailsSent++;
        }

      } catch (cartError: any) {
        console.error(`Error processing cart ${cart.id}:`, cartError);
        errors.push(`Cart ${cart.id}: ${cartError.message}`);
      }
    }

    console.log(`Recovery process completed. Emails sent: ${emailsSent}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Recovery emails processed`,
        emailsSent,
        totalCarts: abandonedCarts.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in recover-abandoned-carts function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
