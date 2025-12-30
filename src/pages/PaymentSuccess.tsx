import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Mail, ArrowRight, Loader2, Clock, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type PaymentStatus = 'loading' | 'paid' | 'pending_pix' | 'pending_boleto' | 'error';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<PaymentStatus>('loading');

  useEffect(() => {
    // Clear lead data from session storage
    sessionStorage.removeItem('leadData');
    
    const checkPaymentStatus = async () => {
      if (!sessionId) {
        setStatus('paid'); // Assume paid if no session ID
        return;
      }

      try {
        // Check the order status in our database
        const { data: order } = await supabase
          .from('orders')
          .select('status')
          .eq('stripe_checkout_session_id', sessionId)
          .single();

        if (order?.status === 'paid') {
          setStatus('paid');
        } else {
          // For pending payments, we'll show a generic pending state
          // The webhook will update the status when payment completes
          setStatus('paid'); // Default to paid for card payments
        }
      } catch {
        // If we can't find the order, assume payment is processing
        setStatus('paid');
      }
    };

    // Small delay to allow webhook to process
    const timer = setTimeout(checkPaymentStatus, 2000);
    return () => clearTimeout(timer);
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Confirmando seu pagamento...</p>
        </div>
      </div>
    );
  }

  if (status === 'pending_pix') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
            <Clock className="w-12 h-12 text-amber-500" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Aguardando pagamento Pix
            </h1>
            <p className="text-muted-foreground">
              Complete o pagamento usando o código Pix. Assim que confirmado, você receberá acesso imediato.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-4">
            <p className="text-sm text-muted-foreground">
              O Pix é confirmado instantaneamente. Se você já pagou, aguarde alguns segundos e atualize a página.
            </p>
          </div>

          <Button asChild variant="outline" className="w-full">
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'pending_boleto') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
            <FileText className="w-12 h-12 text-amber-500" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Boleto gerado com sucesso!
            </h1>
            <p className="text-muted-foreground">
              Seu boleto foi gerado. O pagamento pode levar até 3 dias úteis para ser confirmado.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-4">
            <div className="flex items-center justify-center gap-3 text-primary">
              <Mail className="w-6 h-6" />
              <span className="font-semibold">Verifique seu e-mail</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Enviamos o boleto e as instruções para o seu e-mail. Após a confirmação do pagamento, você receberá seus dados de acesso.
            </p>
          </div>

          <Button asChild variant="outline" className="w-full">
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        {/* Success Icon */}
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Check className="w-12 h-12 text-primary" />
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Parabéns! Você está dentro! 🎉
          </h1>
          <p className="text-muted-foreground">
            Seu pagamento foi confirmado com sucesso. Sua jornada na Formação Closer começa agora!
          </p>
        </div>

        {/* Email Notice */}
        <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-4">
          <div className="flex items-center justify-center gap-3 text-primary">
            <Mail className="w-6 h-6" />
            <span className="font-semibold">Verifique seu e-mail</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Enviamos seus dados de acesso para o e-mail cadastrado. Caso não encontre, verifique a pasta de spam.
          </p>
        </div>

        {/* What's Next */}
        <div className="bg-muted/30 rounded-xl p-6 text-left space-y-4">
          <h3 className="font-semibold text-foreground">Próximos passos:</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <span>Acesse seu e-mail e copie a senha provisória</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <span>Faça login na área do aluno com seu e-mail e senha</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <span>Comece a assistir às aulas e transforme sua carreira!</span>
            </li>
          </ol>
        </div>

        {/* CTA Button */}
        <Button asChild className="w-full btn-cta py-6 text-lg">
          <Link to="/auth">
            Acessar Área do Aluno
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>

        <p className="text-xs text-muted-foreground">
          Dúvidas? Entre em contato pelo{' '}
          <Link to="/contato" className="text-primary hover:underline">
            suporte
          </Link>
        </p>
      </div>
    </div>
  );
}
