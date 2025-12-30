import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, FileText, QrCode, Loader2, Shield, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StripeProvider } from './StripeProvider';
import { CardPaymentForm } from './CardPaymentForm';
import { BoletoPaymentForm } from './BoletoPaymentForm';
import { PixPaymentForm } from './PixPaymentForm';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leadData: {
    name: string;
    email: string;
    phone: string;
  };
  courseData: {
    id: string;
    title: string;
    price_cents: number;
    max_installments: number | null;
  };
}

export function CheckoutModal({ isOpen, onClose, onSuccess, leadData, courseData }: CheckoutModalProps) {
  const [activeTab, setActiveTab] = useState('card');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);

  // PIX key from env (for now, we'll use a placeholder - admin can set via settings)
  const pixKey = import.meta.env.VITE_PIX_KEY || 'chave-pix@exemplo.com';

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  // Create PaymentIntent when modal opens or tab changes
  useEffect(() => {
    if (isOpen && (activeTab === 'card' || activeTab === 'boleto')) {
      createPaymentIntent();
    }
  }, [isOpen, activeTab]);

  const createPaymentIntent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          course_id: courseData.id,
          payment_method: activeTab,
        },
      });

      if (fnError) {
        console.error('Error creating payment intent:', fnError);
        setError('Erro ao iniciar pagamento. Tente novamente.');
        return;
      }

      if (data?.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        setError('Erro ao obter dados de pagamento.');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    toast.success('Pagamento realizado com sucesso!');
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  const handleBoletoSuccess = (url?: string) => {
    if (url) {
      setBoletoUrl(url);
      window.open(url, '_blank');
    }
    toast.success('Boleto gerado! Verifique seu e-mail.');
    setTimeout(() => {
      onSuccess();
    }, 3000);
  };

  const handlePixSuccess = () => {
    toast.success('Pagamento via Pix registrado!');
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    toast.error(errorMessage);
  };

  // Success screen
  if (paymentSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-bold text-foreground">
                Pagamento Confirmado!
              </h2>
              <p className="text-muted-foreground">
                Seu acesso será liberado em instantes.
              </p>
            </div>
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Boleto generated screen
  if (boletoUrl) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-bold text-foreground">
                Boleto Gerado!
              </h2>
              <p className="text-muted-foreground">
                Uma nova aba foi aberta com seu boleto. Você também receberá por e-mail.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Redirecionando...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-display">Finalizar Pagamento</DialogTitle>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium text-foreground">{courseData.title}</p>
              <p className="text-sm text-muted-foreground">Acesso completo</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gradient">{formatCurrency(courseData.price_cents)}</p>
              {courseData.max_installments && courseData.max_installments > 1 && (
                <p className="text-xs text-muted-foreground">
                  ou {courseData.max_installments}x de {formatCurrency(courseData.price_cents / courseData.max_installments)}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="card" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Cartão</span>
            </TabsTrigger>
            <TabsTrigger value="boleto" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Boleto</span>
            </TabsTrigger>
            <TabsTrigger value="pix" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Pix</span>
            </TabsTrigger>
          </TabsList>

          {error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
              <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <TabsContent value="card" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : clientSecret ? (
              <StripeProvider clientSecret={clientSecret}>
                <CardPaymentForm
                  amount={courseData.price_cents}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </StripeProvider>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Erro ao carregar formulário de pagamento.
              </div>
            )}
          </TabsContent>

          <TabsContent value="boleto" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <BoletoPaymentForm
                amount={courseData.price_cents}
                name={leadData.name}
                email={leadData.email}
                courseId={courseData.id}
                onSuccess={handleBoletoSuccess}
                onError={handlePaymentError}
              />
            )}
          </TabsContent>

          <TabsContent value="pix" className="mt-6">
            <PixPaymentForm
              amount={courseData.price_cents}
              courseId={courseData.id}
              name={leadData.name}
              email={leadData.email}
              phone={leadData.phone}
              pixKey={pixKey}
              onSuccess={handlePixSuccess}
              onError={handlePaymentError}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>Pagamento Seguro</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Garantia de 7 dias</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
