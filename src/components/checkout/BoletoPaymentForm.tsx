import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Shield, ExternalLink, Check } from 'lucide-react';
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
  const [cpf, setCpf] = useState('');

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const isFormValid = () => {
    const cpfDigits = cpf.replace(/\D/g, '');
    return cpfDigits.length === 11;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe não inicializado. Aguarde e tente novamente.');
      return;
    }

    if (!isFormValid()) {
      onError('Por favor, preencha o CPF corretamente.');
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
          payment_method_data: {
            billing_details: {
              name,
              email,
            },
          },
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
        <div className="space-y-2">
          <Label>CPF (obrigatório para boleto)</Label>
          <Input
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(formatCPF(e.target.value))}
            maxLength={14}
            required
          />
        </div>

        {/* Stripe PaymentElement for boleto */}
        <div className="space-y-2">
          <Label>Dados do Boleto</Label>
          <div className="p-4 bg-background rounded-lg border border-border">
            <PaymentElement 
              options={{
                layout: 'tabs',
                paymentMethodOrder: ['boleto'],
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
        disabled={isProcessing || !isFormValid() || !stripe || !elements}
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
