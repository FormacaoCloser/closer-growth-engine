import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Clear lead data from session storage
    sessionStorage.removeItem('leadData');
    
    // Simulate verification delay
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Confirmando seu pagamento...</p>
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
