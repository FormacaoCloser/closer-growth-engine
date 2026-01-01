import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Shield, AlertCircle } from 'lucide-react';

interface CardPaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function CardPaymentForm({ amount, onSuccess, onError }: CardPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
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
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/pagamento-sucesso`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment error:', error);
        onError(error.message || 'Erro no pagamento. Tente novamente.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // 3D Secure or other action required - Stripe handles this
        console.log('Payment requires action');
      } else {
        // Redirect happened or other status
        onSuccess();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      onError('Erro inesperado. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {elementError && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">Erro ao carregar formulário</p>
              <p className="text-xs text-muted-foreground">{elementError}</p>
            </div>
          </div>
        )}
        <PaymentElement 
          onReady={() => setElementReady(true)}
          onLoadError={(e) => setElementError(e.error.message || 'Erro ao carregar formulário de pagamento')}
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card'],
            wallets: {
              applePay: 'auto',
              googlePay: 'auto',
            },
          }}
        />
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing || !elementReady || !!elementError}
        className="w-full btn-cta py-6 text-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pagar {formatCurrency(amount)}
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="w-4 h-4" />
        <span>Pagamento 100% seguro via Stripe</span>
      </div>
    </form>
  );
}
