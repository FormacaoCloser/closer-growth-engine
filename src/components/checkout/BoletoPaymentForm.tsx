import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Shield, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface BoletoPaymentFormProps {
  amount: number;
  name: string;
  email: string;
  courseId: string;
  onSuccess: (boletoUrl?: string) => void;
  onError: (error: string) => void;
}

export function BoletoPaymentForm({ amount, name, email, courseId, onSuccess, onError }: BoletoPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [boletoGenerated, setBoletoGenerated] = useState(false);
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
  const [elementReady, setElementReady] = useState(false);
  const [elementError, setElementError] = useState<string | null>(null);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe não inicializado. Aguarde e tente novamente.');
      return;
    }

    if (!elementReady) {
      onError('Formulário de pagamento ainda carregando. Aguarde.');
      return;
    }

    setIsProcessing(true);

    try {
      // Submit the elements first to validate and collect data
      const { error: submitError } = await elements.submit();
      if (submitError) {
        onError(submitError.message || 'Erro ao validar formulário.');
        setIsProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Boleto error:', error);
        onError(error.message || 'Erro ao gerar boleto. Tente novamente.');
        return;
      }

      // Check if boleto was generated (requires_action means we have the boleto URL)
      if (paymentIntent?.status === 'requires_action' && paymentIntent.next_action?.type === 'boleto_display_details') {
        // Type assertion for boleto-specific next_action structure
        const nextAction = paymentIntent.next_action as { 
          type: string; 
          boleto_display_details?: { hosted_voucher_url?: string } 
        };
        const hostedVoucherUrl = nextAction.boleto_display_details?.hosted_voucher_url;
        if (hostedVoucherUrl) {
          setBoletoUrl(hostedVoucherUrl);
          setBoletoGenerated(true);
          onSuccess(hostedVoucherUrl);
          return;
        }
      }

      // For other successful states
      if (paymentIntent?.status === 'processing' || paymentIntent?.status === 'requires_action') {
        setBoletoGenerated(true);
        onSuccess();
      } else {
        onError('Status de pagamento inesperado. Por favor, tente novamente.');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      onError('Erro inesperado. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (boletoGenerated) {
    return (
      <div className="text-center space-y-6 py-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">Boleto Gerado!</h3>
          <p className="text-muted-foreground">
            Você também receberá o boleto por e-mail em <strong>{email}</strong>.
          </p>
        </div>
        {boletoUrl && (
          <Button 
            onClick={() => window.open(boletoUrl, '_blank')}
            className="btn-cta"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir Boleto
          </Button>
        )}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-left">
          <p className="text-sm text-muted-foreground">
            O boleto vence em <strong className="text-foreground">3 dias úteis</strong>.
          </p>
          <p className="text-sm text-muted-foreground">
            Após o pagamento, o acesso é liberado em até <strong className="text-foreground">2 dias úteis</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Stripe PaymentElement for boleto - collects CPF and address */}
        <div className="space-y-2">
          <Label>Dados do Boleto</Label>
          {elementError && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">Erro ao carregar formulário</p>
                <p className="text-xs text-muted-foreground">{elementError}</p>
              </div>
            </div>
          )}
          <div className="p-4 bg-background rounded-lg border border-border">
            <PaymentElement 
              onReady={() => setElementReady(true)}
              onLoadError={(e) => setElementError(e.error.message || 'Erro ao carregar formulário de pagamento')}
              options={{
                layout: 'tabs',
                paymentMethodOrder: ['boleto'],
                defaultValues: {
                  billingDetails: {
                    name,
                    email,
                  },
                },
                fields: {
                  billingDetails: {
                    name: 'never',
                    email: 'never',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <p className="text-sm text-muted-foreground">
          O boleto vence em <strong className="text-foreground">3 dias úteis</strong>.
        </p>
        <p className="text-sm text-muted-foreground">
          Após o pagamento, o acesso é liberado em até <strong className="text-foreground">2 dias úteis</strong>.
        </p>
      </div>

      <Button
        type="submit"
        disabled={isProcessing || !stripe || !elements || !elementReady || !!elementError}
        className="w-full btn-cta py-6 text-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Gerando boleto...
          </>
        ) : (
          <>
            <FileText className="w-5 h-5 mr-2" />
            Gerar Boleto de {formatCurrency(amount)}
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="w-4 h-4" />
        <span>Boleto processado via Stripe</span>
      </div>
    </form>
  );
}
