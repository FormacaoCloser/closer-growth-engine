import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckCertificateRequest {
  userId: string;
  lessonId: string;
}

function generateCertificateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const year = new Date().getFullYear();
  return `CERT-${code}-${year}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, lessonId }: CheckCertificateRequest = await req.json();

    console.log(`Checking certificate for user ${userId}, lesson ${lessonId}`);

    if (!userId || !lessonId) {
      return new Response(
        JSON.stringify({ error: "userId and lessonId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Get the course_id from lesson -> module -> course
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("module_id, modules!inner(course_id)")
      .eq("id", lessonId)
      .single();

    if (lessonError || !lesson) {
      console.error("Error fetching lesson:", lessonError);
      return new Response(
        JSON.stringify({ error: "Lesson not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const courseId = (lesson.modules as any).course_id;
    console.log(`Course ID: ${courseId}`);

    // 2. Check if certificate already exists
    const { data: existingCert } = await supabase
      .from("certificates")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existingCert) {
      console.log("Certificate already exists for this user and course");
      return new Response(
        JSON.stringify({ alreadyIssued: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Get all active lessons for the course
    const { data: allLessons, error: allLessonsError } = await supabase
      .from("lessons")
      .select("id, modules!inner(course_id)")
      .eq("modules.course_id", courseId)
      .eq("is_active", true);

    if (allLessonsError) {
      console.error("Error fetching all lessons:", allLessonsError);
      return new Response(
        JSON.stringify({ error: "Error fetching lessons" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const totalLessons = allLessons?.length || 0;
    console.log(`Total active lessons: ${totalLessons}`);

    if (totalLessons === 0) {
      return new Response(
        JSON.stringify({ error: "No lessons found for this course" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Get completed lessons for this user in this course
    const lessonIds = allLessons.map((l) => l.id);
    const { data: completedLessons, error: completedError } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .eq("is_completed", true)
      .in("lesson_id", lessonIds);

    if (completedError) {
      console.error("Error fetching completed lessons:", completedError);
      return new Response(
        JSON.stringify({ error: "Error fetching progress" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const completedCount = completedLessons?.length || 0;
    const progressPercent = (completedCount / totalLessons) * 100;
    console.log(`Progress: ${completedCount}/${totalLessons} (${progressPercent.toFixed(1)}%)`);

    // 5. If not 100%, return progress
    if (completedCount < totalLessons) {
      return new Response(
        JSON.stringify({ 
          issued: false, 
          progress: progressPercent,
          completed: completedCount,
          total: totalLessons 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Generate certificate
    console.log("Course 100% completed! Generating certificate...");
    const certificateCode = generateCertificateCode();

    const { data: newCert, error: insertError } = await supabase
      .from("certificates")
      .insert({
        user_id: userId,
        course_id: courseId,
        code: certificateCode,
        issued_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting certificate:", insertError);
      return new Response(
        JSON.stringify({ error: "Error creating certificate" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Certificate created: ${certificateCode}`);

    // 7. Get user and course details for email
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("user_id", userId)
      .single();

    const { data: course } = await supabase
      .from("courses")
      .select("title")
      .eq("id", courseId)
      .single();

    const studentName = profile?.full_name || "Aluno";
    const studentEmail = profile?.email;
    const courseName = course?.title || "Curso";

    // 8. Send congratulations email
    if (resendApiKey && studentEmail) {
      try {
        const resend = new Resend(resendApiKey);
        
        const issueDate = new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎓 Parabéns!</h1>
              <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 18px;">Você concluiu o curso com sucesso!</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #eee; border-top: none;">
              <p style="font-size: 16px;">Olá <strong>${studentName}</strong>,</p>
              
              <p style="font-size: 16px;">Você completou 100% do curso:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin: 20px 0; text-align: center;">
                <h2 style="color: #667eea; margin: 0 0 15px 0;">📚 ${courseName}</h2>
                <p style="margin: 0; color: #666;">
                  <strong>Certificado:</strong> ${certificateCode}<br>
                  <strong>Data:</strong> ${issueDate}
                </p>
              </div>
              
              <p style="font-size: 16px;">Seu certificado já está disponível na plataforma. Acesse a área do aluno para visualizar e baixar.</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app")}/aluno/certificados" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Ver Meu Certificado
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #888; font-size: 14px; text-align: center;">
                Continue aprendendo e evoluindo!<br>
                Equipe da Plataforma
              </p>
            </div>
          </body>
          </html>
        `;

        const emailResponse = await resend.emails.send({
          from: "Certificado <onboarding@resend.dev>",
          to: [studentEmail],
          subject: `🎓 Parabéns! Seu certificado de ${courseName} está disponível!`,
          html: emailHtml,
        });

        console.log("Congratulations email sent:", emailResponse);
      } catch (emailError) {
        console.error("Error sending email (certificate was still created):", emailError);
      }
    } else {
      console.log("Email not sent: missing RESEND_API_KEY or student email");
    }

    return new Response(
      JSON.stringify({ 
        issued: true, 
        certificateId: newCert.id,
        code: certificateCode 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
