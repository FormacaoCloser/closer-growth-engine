import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Appearance } from '@stripe/stripe-js';
import { ReactNode } from 'react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

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
  const options = {
    clientSecret,
    appearance,
    locale: 'pt-BR' as const,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
