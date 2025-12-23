import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Building2 } from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";

export function GeneralSettingsTab() {
  const { settings, isLoading, getValue, updateMultipleSettings } = useSystemSettings("general");
  
  const [platformName, setPlatformName] = useState("");
  const [platformLogoUrl, setPlatformLogoUrl] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [platformDescription, setPlatformDescription] = useState("");

  useEffect(() => {
    if (settings) {
      setPlatformName(getValue("platform_name"));
      setPlatformLogoUrl(getValue("platform_logo_url"));
      setSupportEmail(getValue("support_email"));
      setPlatformDescription(getValue("platform_description"));
    }
  }, [settings]);

  const handleSave = () => {
    updateMultipleSettings.mutate([
      { key: "platform_name", value: platformName },
      { key: "platform_logo_url", value: platformLogoUrl },
      { key: "support_email", value: supportEmail },
      { key: "platform_description", value: platformDescription },
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Informações da Plataforma
        </CardTitle>
        <CardDescription>
          Configure as informações básicas da sua plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="platform_name">Nome da Plataforma</Label>
            <Input
              id="platform_name"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              placeholder="Ex: Formação Closer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="support_email">Email de Suporte</Label>
            <Input
              id="support_email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="suporte@exemplo.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="platform_logo_url">URL do Logo</Label>
          <Input
            id="platform_logo_url"
            value={platformLogoUrl}
            onChange={(e) => setPlatformLogoUrl(e.target.value)}
            placeholder="https://exemplo.com/logo.png"
          />
          {platformLogoUrl && (
            <div className="mt-2 p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <img 
                src={platformLogoUrl} 
                alt="Logo preview" 
                className="max-h-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="platform_description">Descrição / Tagline</Label>
          <Textarea
            id="platform_description"
            value={platformDescription}
            onChange={(e) => setPlatformDescription(e.target.value)}
            placeholder="Uma breve descrição da sua plataforma..."
            rows={3}
          />
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
  );
}
