import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Copy, Check, QrCode, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PixPaymentFormProps {
  amount: number;
  courseId: string;
  name: string;
  email: string;
  phone: string;
  pixKey: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function PixPaymentForm({ 
  amount, 
  courseId, 
  name, 
  email, 
  phone, 
  pixKey,
  onSuccess, 
  onError 
}: PixPaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const handleCopyPixKey = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      toast.success('Chave Pix copiada!');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error('Erro ao copiar');
    }
  };

  const handleConfirmPayment = async () => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('manual_pix_payments')
        .insert({
          email,
          name,
          phone,
          course_id: courseId,
          amount_cents: amount,
          status: 'pending',
        });

      if (error) {
        console.error('Error saving pix payment:', error);
        onError('Erro ao registrar pagamento. Tente novamente.');
        return;
      }

      setSubmitted(true);
      toast.success('Pagamento registrado! Aguarde a verificação.');
      onSuccess();
    } catch (err) {
      console.error('Unexpected error:', err);
      onError('Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-6 py-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">Pagamento Registrado!</h3>
          <p className="text-muted-foreground">
            Nossa equipe irá verificar seu pagamento e liberar seu acesso em até 24 horas.
          </p>
          <p className="text-sm text-muted-foreground">
            Você receberá um e-mail em <strong className="text-foreground">{email}</strong> quando o acesso for liberado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-xl p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <QrCode className="w-8 h-8 text-primary" />
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Valor a pagar:</p>
          <p className="text-3xl font-bold text-gradient">{formatCurrency(amount)}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Copie a chave Pix abaixo:</p>
          <div className="flex gap-2">
            <Input 
              value={pixKey} 
              readOnly 
              className="text-center font-mono bg-background"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopyPixKey}
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Importante</p>
          <p className="text-sm text-muted-foreground">
            Após realizar o Pix no app do seu banco, clique no botão abaixo para registrar seu pagamento. 
            Nossa equipe irá verificar e liberar seu acesso em até 24 horas.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Como pagar:</p>
        <ol className="text-sm text-muted-foreground space-y-2">
          <li className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0">1</span>
            Abra o app do seu banco
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0">2</span>
            Escolha a opção Pix e cole a chave copiada
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0">3</span>
            Confirme o valor de {formatCurrency(amount)}
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0">4</span>
            Clique no botão abaixo após realizar o pagamento
          </li>
        </ol>
      </div>

      <Button
        onClick={handleConfirmPayment}
        disabled={isSubmitting}
        className="w-full btn-cta py-6 text-lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Registrando pagamento...
          </>
        ) : (
          <>
            <Check className="w-5 h-5 mr-2" />
            Já fiz o pagamento via Pix
          </>
        )}
      </Button>
    </div>
  );
}
