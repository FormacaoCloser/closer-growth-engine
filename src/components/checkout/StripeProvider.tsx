import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Appearance } from '@stripe/stripe-js';
import { ReactNode, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// Validate key format
const isValidStripeKey = stripePublishableKey && 
  (stripePublishableKey.startsWith('pk_test_') || stripePublishableKey.startsWith('pk_live_'));

const stripePromise = isValidStripeKey ? loadStripe(stripePublishableKey) : null;

const appearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#22c55e',
    colorBackground: '#1a1f2e',
    colorText: '#e5e7eb',
    colorTextSecondary: '#9ca3af',
    colorDanger: '#ef4444',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '12px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      backgroundColor: '#0f1318',
      border: '1px solid #2d3748',
      boxShadow: 'none',
      padding: '12px 16px',
    },
    '.Input:focus': {
      border: '1px solid #22c55e',
      boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.2)',
    },
    '.Label': {
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '8px',
    },
    '.Tab': {
      backgroundColor: '#1a1f2e',
      border: '1px solid #2d3748',
    },
    '.Tab--selected': {
      backgroundColor: '#22c55e',
      borderColor: '#22c55e',
    },
  },
};

interface StripeProviderProps {
  clientSecret: string;
  children: ReactNode;
}

export function StripeProvider({ clientSecret, children }: StripeProviderProps) {
  const options = useMemo(() => ({
    clientSecret,
    appearance,
    locale: 'pt-BR' as const,
  }), [clientSecret]);

  // Show error if Stripe key is invalid
  if (!isValidStripeKey) {
    console.error('Invalid or missing VITE_STRIPE_PUBLISHABLE_KEY:', stripePublishableKey ? 'Invalid format' : 'Missing');
    return (
      <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-lg text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
        <div className="space-y-1">
          <p className="font-medium text-destructive">Erro de configuração</p>
          <p className="text-sm text-muted-foreground">
            A chave do Stripe não está configurada corretamente. Por favor, contate o suporte.
          </p>
        </div>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-lg text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
        <p className="text-sm text-muted-foreground">
          Erro ao inicializar o processador de pagamentos.
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
