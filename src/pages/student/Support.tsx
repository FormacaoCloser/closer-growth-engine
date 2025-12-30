import { StudentLayout } from "@/components/student/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, Clock } from "lucide-react";

export default function StudentSupport() {
  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">
            Suporte
          </h1>
          <p className="text-muted-foreground">
            Precisa de ajuda? Entre em contato conosco.
          </p>
        </div>

        {/* Support Options */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Para dúvidas rápidas, entre em contato pelo WhatsApp.
              </p>
              <Button asChild>
                <a 
                  href="https://wa.me/5511999999999" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Abrir WhatsApp
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                E-mail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Para questões mais detalhadas, envie um e-mail para nossa equipe.
              </p>
              <Button variant="outline" asChild>
                <a href="mailto:suporte@formacaocloser.com" className="gap-2">
                  <Mail className="w-4 h-4" />
                  suporte@formacaocloser.com
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Horário de Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-muted-foreground">
                <p>Segunda a Sexta: 9h às 18h</p>
                <p>Sábado: 9h às 12h</p>
                <p className="text-sm">
                  Respondemos em até 24 horas úteis.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}
