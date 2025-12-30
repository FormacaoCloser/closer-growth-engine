import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { StudentLayout } from "@/components/student/StudentLayout";
import { CertificateView } from "@/components/student/CertificateView";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Award } from "lucide-react";
import { toast } from "sonner";

export default function StudentCertificateDetail() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const { user } = useAuth();

  const { data: certificate, isLoading } = useQuery({
    queryKey: ["certificate", certificateId, user?.id],
    queryFn: async () => {
      if (!user?.id || !certificateId) return null;

      const { data, error } = await supabase
        .from("certificates")
        .select(`
          *,
          courses (
            title
          )
        `)
        .eq("id", certificateId)
        .eq("user_id", user.id)
        .single();

      if (error) return null;

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", user.id)
        .single();

      return {
        ...data,
        studentName: profile?.full_name || profile?.email || user.email || "Aluno",
      };
    },
    enabled: !!user?.id && !!certificateId,
  });

  const handleDownload = () => {
    toast.info("Funcionalidade de download em desenvolvimento");
    // TODO: Implement PDF generation
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96" />
        </div>
      </StudentLayout>
    );
  }

  if (!certificate) {
    return (
      <StudentLayout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Award className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">
            Certificado não encontrado
          </h2>
          <p className="text-muted-foreground mb-6">
            O certificado não existe ou você não tem acesso.
          </p>
          <Link to="/aluno/certificados">
            <Button>Ver meus certificados</Button>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <Link to="/aluno/certificados">
          <Button variant="ghost" className="gap-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </Link>

        {/* Certificate */}
        <CertificateView
          studentName={certificate.studentName}
          courseName={(certificate.courses as any)?.title}
          certificateCode={certificate.certificate_code}
          issuedAt={certificate.issued_at}
          onDownload={handleDownload}
        />
      </div>
    </StudentLayout>
  );
}
