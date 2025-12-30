import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BoletoPaymentFormProps {
  amount: number;
  name: string;
  email: string;
  courseId: string;
  onSuccess: (boletoUrl?: string) => void;
  onError: (error: string) => void;
}

export function BoletoPaymentForm({ amount, name, email, courseId, onSuccess, onError }: BoletoPaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [cpf, setCpf] = useState('');
  const [address, setAddress] = useState({
    city: '',
    state: '',
    postal_code: '',
    street: '',
    number: '',
  });

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const formatPostalCode = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const isFormValid = () => {
    const cpfDigits = cpf.replace(/\D/g, '');
    const postalDigits = address.postal_code.replace(/\D/g, '');
    
    return (
      cpfDigits.length === 11 &&
      address.city.length >= 2 &&
      address.state.length === 2 &&
      postalDigits.length === 8 &&
      address.street.length >= 3 &&
      address.number.length >= 1
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      onError('Por favor, preencha todos os campos corretamente.');
      return;
    }

    setIsProcessing(true);

    try {
      // Use the create-checkout function with boleto method
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          name,
          email,
          course_id: courseId,
          payment_method: 'boleto',
          cpf: cpf.replace(/\D/g, ''),
          address: {
            city: address.city,
            state: address.state,
            postal_code: address.postal_code.replace(/\D/g, ''),
            line1: `${address.street}, ${address.number}`,
          },
        },
      });

      if (error) {
        console.error('Boleto error:', error);
        onError('Erro ao gerar boleto. Tente novamente.');
        return;
      }

      if (data?.url) {
        // Redirect to Stripe checkout for boleto
        window.location.href = data.url;
      } else {
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
        <div className="space-y-2">
          <Label>CPF</Label>
          <Input
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(formatCPF(e.target.value))}
            maxLength={14}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>CEP</Label>
            <Input
              placeholder="00000-000"
              value={address.postal_code}
              onChange={(e) => setAddress({ ...address, postal_code: formatPostalCode(e.target.value) })}
              maxLength={9}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Input
              placeholder="SP"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })}
              maxLength={2}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Cidade</Label>
          <Input
            placeholder="São Paulo"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-2">
            <Label>Rua</Label>
            <Input
              placeholder="Rua Example"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Número</Label>
            <Input
              placeholder="123"
              value={address.number}
              onChange={(e) => setAddress({ ...address, number: e.target.value })}
              required
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
        disabled={isProcessing || !isFormValid()}
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
        <span>Boleto gerado via Stripe</span>
      </div>
    </form>
  );
}
