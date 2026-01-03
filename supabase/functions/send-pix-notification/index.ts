import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PixNotificationRequest {
  type: "approved" | "rejected";
  email: string;
  name: string;
  courseName?: string;
  amount_cents: number;
  notes?: string;
  platformUrl?: string;
}

const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
};

const getApprovedEmailHtml = (name: string, courseName: string, amount: string, platformUrl: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px 12px 0 0;">
              <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                Pagamento Confirmado!
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Seu pagamento Pix de <strong style="color: #059669;">${amount}</strong> foi confirmado com sucesso!
              </p>
              
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                Agora você tem acesso completo ao curso <strong>${courseName}</strong>.
              </p>
              
              <!-- Info Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981;">
                    <p style="margin: 0 0 10px; color: #065f46; font-size: 14px; font-weight: 600;">
                      Para começar a estudar:
                    </p>
                    <ol style="margin: 0; padding-left: 20px; color: #065f46; font-size: 14px; line-height: 1.8;">
                      <li>Acesse a plataforma no link abaixo</li>
                      <li>Faça login ou cadastre-se com este email</li>
                      <li>Seus cursos estarão disponíveis no painel</li>
                    </ol>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${platformUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Acessar Plataforma
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Bons estudos! 📚
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

const getRejectedEmailHtml = (name: string, courseName: string, amount: string, reason: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 12px 12px 0 0;">
              <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                Pagamento Não Confirmado
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Infelizmente não conseguimos confirmar seu pagamento Pix de <strong>${amount}</strong>${courseName ? ` para o curso <strong>${courseName}</strong>` : ''}.
              </p>
              
              <!-- Reason Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
                    <p style="margin: 0 0 8px; color: #991b1b; font-size: 14px; font-weight: 600;">
                      Motivo:
                    </p>
                    <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                      ${reason || "Não foi possível verificar o comprovante de pagamento."}
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Se você acredita que houve um erro, entre em contato conosco respondendo a este email ou através dos nossos canais de atendimento.
              </p>
              
              <!-- Info Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
                    <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                      💡 <strong>Dica:</strong> Certifique-se de que o valor transferido corresponde exatamente ao valor do curso e que a chave Pix utilizada é a correta.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Estamos à disposição para ajudar!
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      type, 
      email, 
      name, 
      courseName, 
      amount_cents, 
      notes,
      platformUrl = "https://kpxdglccqxkudlasexki.lovableproject.com"
    }: PixNotificationRequest = await req.json();

    console.log(`Sending ${type} notification to ${email}`);

    const amount = formatCurrency(amount_cents);
    const course = courseName || "seu curso";

    let subject: string;
    let html: string;

    if (type === "approved") {
      subject = `✅ Pagamento Confirmado! Bem-vindo ao ${course}`;
      html = getApprovedEmailHtml(name, course, amount, platformUrl);
    } else {
      subject = `⚠️ Pagamento Pix Não Confirmado`;
      html = getRejectedEmailHtml(name, course, amount, notes || "");
    }

    const emailResponse = await resend.emails.send({
      from: "Notificações <onboarding@resend.dev>",
      to: [email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-pix-notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
