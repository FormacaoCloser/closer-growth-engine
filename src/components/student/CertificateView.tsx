import { Award, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CertificateViewProps {
  studentName: string;
  courseName: string;
  certificateCode: string;
  issuedAt: string;
  onDownload?: () => void;
}

export function CertificateView({
  studentName,
  courseName,
  certificateCode,
  issuedAt,
  onDownload,
}: CertificateViewProps) {
  const formattedDate = format(new Date(issuedAt), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Certificate Card */}
      <div className="relative bg-gradient-to-br from-card via-card to-muted border-4 border-primary/30 rounded-2xl p-8 md:p-12 shadow-2xl">
        {/* Decorative Border */}
        <div className="absolute inset-4 border-2 border-primary/20 rounded-xl pointer-events-none" />
        
        {/* Corner Decorations */}
        <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-primary/40 rounded-tl-lg" />
        <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-primary/40 rounded-tr-lg" />
        <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-primary/40 rounded-bl-lg" />
        <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-primary/40 rounded-br-lg" />

        {/* Content */}
        <div className="relative text-center space-y-6">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Award className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              Certificado de Conclusão
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient">
              Formação Closer
            </h1>
          </div>

          {/* Divider */}
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />

          {/* Main Content */}
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              Certificamos que
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {studentName}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              concluiu com êxito o curso
            </p>
            <h3 className="font-display text-2xl font-semibold text-primary">
              {courseName}
            </h3>
          </div>

          {/* Date */}
          <p className="text-muted-foreground">
            Emitido em {formattedDate}
          </p>

          {/* Certificate Code */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Código de verificação
            </p>
            <p className="font-mono text-sm font-medium text-foreground mt-1">
              {certificateCode}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4 mt-8">
        <Button onClick={onDownload} className="gap-2">
          <Download className="w-4 h-4" />
          Baixar PDF
        </Button>
        <Button variant="outline" className="gap-2">
          <ExternalLink className="w-4 h-4" />
          Compartilhar
        </Button>
      </div>
    </div>
  );
}
