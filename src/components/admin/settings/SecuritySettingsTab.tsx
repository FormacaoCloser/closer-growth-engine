import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Shield, Clock, Key, Activity } from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";

export function SecuritySettingsTab() {
  const { settings, isLoading, getValue, getBooleanValue, updateMultipleSettings } = useSystemSettings("security");
  
  const [sessionDuration, setSessionDuration] = useState("");
  const [require2FA, setRequire2FA] = useState(false);

  useEffect(() => {
    if (settings) {
      setSessionDuration(getValue("session_duration_hours"));
      setRequire2FA(getBooleanValue("require_2fa_admins"));
    }
  }, [settings]);

  const handleSave = () => {
    updateMultipleSettings.mutate([
      { key: "session_duration_hours", value: sessionDuration },
      { key: "require_2fa_admins", value: require2FA.toString() },
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
            <Shield className="h-5 w-5" />
            Configurações de Segurança
          </CardTitle>
          <CardDescription>
            Configure as opções de segurança do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Session Duration */}
          <div className="space-y-2">
            <Label htmlFor="session_duration" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duração da Sessão
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="session_duration"
                type="number"
                min="1"
                max="168"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(e.target.value)}
                className="max-w-24"
              />
              <span className="text-muted-foreground">horas</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Tempo até o usuário precisar fazer login novamente (máx. 168h = 7 dias)
            </p>
          </div>

          {/* 2FA Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="require_2fa" className="text-base flex items-center gap-2">
                <Key className="h-4 w-4" />
                Exigir 2FA para Admins
              </Label>
              <p className="text-sm text-muted-foreground">
                Força autenticação em dois fatores para todos os administradores
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Em breve</Badge>
              <Switch
                id="require_2fa"
                checked={require2FA}
                onCheckedChange={setRequire2FA}
                disabled
              />
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

      {/* Activity Log Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Log de Atividades
          </CardTitle>
          <CardDescription>
            Visualize as atividades recentes no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Em breve</h3>
            <p className="text-muted-foreground max-w-md">
              Aqui você poderá visualizar todas as atividades realizadas por 
              administradores no sistema, como logins, alterações de configuração e mais.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
