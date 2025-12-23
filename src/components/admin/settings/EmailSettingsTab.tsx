import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Mail, Send, AlertCircle } from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function EmailSettingsTab() {
  const { settings, isLoading, getValue, updateMultipleSettings } = useSystemSettings("email");
  
  const [emailFromName, setEmailFromName] = useState("");
  const [emailFromAddress, setEmailFromAddress] = useState("");

  useEffect(() => {
    if (settings) {
      setEmailFromName(getValue("email_from_name"));
      setEmailFromAddress(getValue("email_from_address"));
    }
  }, [settings]);

  const handleSave = () => {
    updateMultipleSettings.mutate([
      { key: "email_from_name", value: emailFromName },
      { key: "email_from_address", value: emailFromAddress },
    ]);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Configurações de Email
          </CardTitle>
          <CardDescription>
            Configure como os emails serão enviados para seus alunos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Para enviar emails, você precisará configurar um serviço de email (Resend, SendGrid, etc.) 
              através de uma edge function.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email_from_name">Nome do Remetente</Label>
              <Input
                id="email_from_name"
                value={emailFromName}
                onChange={(e) => setEmailFromName(e.target.value)}
                placeholder="Ex: Formação Closer"
              />
              <p className="text-sm text-muted-foreground">
                Nome que aparecerá como remetente dos emails
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_from_address">Email do Remetente</Label>
              <Input
                id="email_from_address"
                type="email"
                value={emailFromAddress}
                onChange={(e) => setEmailFromAddress(e.target.value)}
                placeholder="noreply@exemplo.com"
              />
              <p className="text-sm text-muted-foreground">
                Endereço de email que será usado para enviar
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={updateMultipleSettings.isPending}
            >
              {updateMultipleSettings.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Email Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Teste de Envio
          </CardTitle>
          <CardDescription>
            Envie um email de teste para verificar as configurações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input 
              placeholder="Digite seu email para teste..." 
              type="email"
              className="max-w-md"
            />
            <Button variant="outline" disabled>
              <Send className="h-4 w-4 mr-2" />
              Enviar Teste
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            * Funcionalidade disponível após configurar serviço de email
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
