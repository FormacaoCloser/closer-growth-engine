import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw, MessageCircle } from 'lucide-react';

export default function PaymentCanceled() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto">
          <XCircle className="w-12 h-12 text-muted-foreground" />
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Pagamento não finalizado
          </h1>
          <p className="text-muted-foreground">
            Parece que você cancelou o pagamento ou algo deu errado. Não se preocupe, você pode tentar novamente!
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-card rounded-2xl p-6 border border-border/50 text-left space-y-4">
          <h3 className="font-semibold text-foreground">Possíveis motivos:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Você fechou a página de pagamento antes de finalizar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>O cartão foi recusado pela operadora</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Problemas temporários de conexão</span>
            </li>
          </ul>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Button asChild className="w-full btn-cta py-6 text-lg">
            <Link to="/matricula">
              <RefreshCw className="w-5 h-5 mr-2" />
              Tentar Novamente
            </Link>
          </Button>

          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao início
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/contato">
                <MessageCircle className="w-4 h-4 mr-2" />
                Falar com suporte
              </Link>
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          A oferta especial ainda está disponível. Garanta sua vaga antes que as vagas acabem!
        </p>
      </div>
    </div>
  );
}
