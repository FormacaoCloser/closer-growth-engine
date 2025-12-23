import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Users, Percent, Clock, FileText } from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";

export function AffiliateSettingsTab() {
  const { settings, isLoading, getValue, getBooleanValue, getNumberValue, updateMultipleSettings } = useSystemSettings("affiliate");
  
  const [programEnabled, setProgramEnabled] = useState(false);
  const [defaultCommission, setDefaultCommission] = useState("");
  const [cookieDays, setCookieDays] = useState("");
  const [termsUrl, setTermsUrl] = useState("");

  useEffect(() => {
    if (settings) {
      setProgramEnabled(getBooleanValue("affiliate_program_enabled"));
      setDefaultCommission(getValue("default_affiliate_commission"));
      setCookieDays(getValue("affiliate_cookie_days"));
      setTermsUrl(getValue("affiliate_terms_url"));
    }
  }, [settings]);

  const handleSave = () => {
    updateMultipleSettings.mutate([
      { key: "affiliate_program_enabled", value: programEnabled.toString() },
      { key: "default_affiliate_commission", value: defaultCommission },
      { key: "affiliate_cookie_days", value: cookieDays },
      { key: "affiliate_terms_url", value: termsUrl },
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
          <Users className="h-5 w-5" />
          Programa de Afiliados
        </CardTitle>
        <CardDescription>
          Configure as regras do programa de afiliados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Program Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="program_enabled" className="text-base">
              Programa Ativo
            </Label>
            <p className="text-sm text-muted-foreground">
              Ative ou desative o programa de afiliados
            </p>
          </div>
          <Switch
            id="program_enabled"
            checked={programEnabled}
            onCheckedChange={setProgramEnabled}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Default Commission */}
          <div className="space-y-2">
            <Label htmlFor="default_commission" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Comissão Padrão
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="default_commission"
                type="number"
                min="0"
                max="100"
                value={defaultCommission}
                onChange={(e) => setDefaultCommission(e.target.value)}
                className="max-w-24"
              />
              <span className="text-muted-foreground">%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Comissão aplicada automaticamente para novos afiliados
            </p>
          </div>

          {/* Cookie Duration */}
          <div className="space-y-2">
            <Label htmlFor="cookie_days" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Validade do Cookie
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="cookie_days"
                type="number"
                min="1"
                max="365"
                value={cookieDays}
                onChange={(e) => setCookieDays(e.target.value)}
                className="max-w-24"
              />
              <span className="text-muted-foreground">dias</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Por quanto tempo o cookie de afiliado permanece ativo
            </p>
          </div>
        </div>

        {/* Terms URL */}
        <div className="space-y-2">
          <Label htmlFor="terms_url" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            URL dos Termos de Afiliado
          </Label>
          <Input
            id="terms_url"
            value={termsUrl}
            onChange={(e) => setTermsUrl(e.target.value)}
            placeholder="https://exemplo.com/termos-afiliado"
          />
          <p className="text-sm text-muted-foreground">
            Link para a página com os termos e condições do programa
          </p>
        </div>

        {/* Stats Preview */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-2">Resumo do Programa</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{defaultCommission || 0}%</p>
              <p className="text-xs text-muted-foreground">Comissão</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{cookieDays || 0}</p>
              <p className="text-xs text-muted-foreground">Dias de Cookie</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{programEnabled ? "✓" : "✗"}</p>
              <p className="text-xs text-muted-foreground">Status</p>
            </div>
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
  );
}
