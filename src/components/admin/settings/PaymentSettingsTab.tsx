import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, CreditCard, Copy, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { toast } from "@/hooks/use-toast";

export function PaymentSettingsTab() {
  const { settings, isLoading, getValue, getBooleanValue, updateMultipleSettings } = useSystemSettings("payment");
  
  const [defaultCurrency, setDefaultCurrency] = useState("");
  const stripeEnabled = getBooleanValue("stripe_enabled");

  // Get the webhook URL from env
  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-webhook`;

  useEffect(() => {
    if (settings) {
      setDefaultCurrency(getValue("default_currency"));
    }
  }, [settings]);

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "Copiado!",
      description: "URL do webhook copiada para a área de transferência.",
    });
  };

  const handleSave = () => {
    updateMultipleSettings.mutate([
      { key: "default_currency", value: defaultCurrency },
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
      {/* Stripe Integration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Integração com Stripe
          </CardTitle>
          <CardDescription>
            Configure sua integração com o Stripe para receber pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {stripeEnabled ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Status da Integração</p>
                <p className="text-sm text-muted-foreground">
                  {stripeEnabled 
                    ? "Stripe conectado e funcionando" 
                    : "Stripe não está conectado"}
                </p>
              </div>
            </div>
            <Badge variant={stripeEnabled ? "default" : "secondary"}>
              {stripeEnabled ? "Conectado" : "Desconectado"}
            </Badge>
          </div>

          {!stripeEnabled && (
            <div className="p-4 border-2 border-dashed rounded-lg text-center space-y-3">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium">Conecte sua conta Stripe</p>
                <p className="text-sm text-muted-foreground">
                  Para receber pagamentos, você precisa conectar sua conta Stripe
                </p>
              </div>
              <Button>
                <ExternalLink className="h-4 w-4 mr-2" />
                Conectar Stripe
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label>URL do Webhook</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Configure esta URL no dashboard do Stripe para receber notificações de pagamento
            </p>
            <div className="flex gap-2">
              <Input 
                value={webhookUrl} 
                readOnly 
                className="font-mono text-sm"
              />
              <Button variant="outline" onClick={handleCopyWebhook}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Pagamento</CardTitle>
          <CardDescription>
            Configure as opções padrão de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="default_currency">Moeda Padrão</Label>
            <select
              id="default_currency"
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="BRL">BRL - Real Brasileiro</option>
              <option value="USD">USD - Dólar Americano</option>
              <option value="EUR">EUR - Euro</option>
            </select>
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
    </div>
  );
}
