import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, CreditCard, User, KeyRound, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LeadData {
  name: string;
  email: string;
  phone: string;
}

interface CourseData {
  id: string;
  title: string;
  price_cents: number;
  max_installments: number | null;
}

const steps = [
  { id: 1, title: 'Dados', icon: User },
  { id: 2, title: 'Checkout', icon: CreditCard },
  { id: 3, title: 'Acesso', icon: KeyRound },
];

export default function Enrollment() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [cpf, setCpf] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');

  useEffect(() => {
    // Get lead data from sessionStorage
    const storedData = sessionStorage.getItem('leadData');
    if (storedData) {
      setLeadData(JSON.parse(storedData));
    } else {
      // No lead data, redirect back to home
      toast.error('Por favor, preencha seus dados primeiro.');
      navigate('/');
      return;
    }

    // Fetch course info
    const fetchCourse = async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, title, price_cents, max_installments')
        .eq('is_active', true)
        .limit(1)
        .single();
      
      if (data) {
        setCourse(data);
      }
    };

    fetchCourse();
  }, [navigate]);

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

  const handleContinueToCheckout = () => {
    // Update abandoned cart step
    if (leadData?.email && course?.id) {
      supabase
        .from('abandoned_carts')
        .update({ checkout_step: 'dados_cadastrais' })
        .eq('email', leadData.email)
        .eq('course_id', course.id);
    }
    setCurrentStep(2);
  };

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Integrate with Stripe here
      // For now, simulate payment success
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
      setTemporaryPassword(tempPassword);

      // Update abandoned cart as recovered
      if (leadData?.email && course?.id) {
        await supabase
          .from('abandoned_carts')
          .update({ 
            recovered: true,
            checkout_step: 'payment_completed' 
          })
          .eq('email', leadData.email)
          .eq('course_id', course.id);
      }

      toast.success('Pagamento confirmado!');
      setCurrentStep(3);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Erro no pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessCourse = () => {
    // Clear session data
    sessionStorage.removeItem('leadData');
    navigate('/aluno');
  };

  if (!leadData || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 py-4">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <span className="text-lg font-display font-bold text-gradient">Formação Closer</span>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-border/50 py-6">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-center gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep > step.id 
                      ? 'bg-primary border-primary text-primary-foreground'
                      : currentStep === step.id 
                        ? 'border-primary text-primary'
                        : 'border-muted text-muted-foreground'
                  }`}>
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="hidden sm:inline font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 sm:w-24 h-0.5 mx-2 transition-colors ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Step 1: Dados Cadastrais */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-display font-bold text-foreground">
                Confirme seus dados
              </h1>
              <p className="text-muted-foreground">
                Verifique se suas informações estão corretas.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome completo</Label>
                  <Input 
                    value={leadData.name} 
                    readOnly 
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input 
                    value={leadData.email} 
                    readOnly 
                    className="bg-muted/50"
                  />
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input 
                    value={leadData.phone} 
                    readOnly 
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF (opcional)</Label>
                  <Input 
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    maxLength={14}
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleContinueToCheckout}
              className="w-full btn-cta py-6 text-lg group"
            >
              Continuar para Pagamento
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {/* Step 2: Checkout */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-display font-bold text-foreground">
                Finalizar Matrícula
              </h1>
              <p className="text-muted-foreground">
                Complete seu pagamento para garantir sua vaga.
              </p>
            </div>

            {/* Course Summary */}
            <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{course.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">Acesso completo + bônus exclusivos</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gradient">
                    {formatCurrency(course.price_cents)}
                  </div>
                  {course.max_installments && course.max_installments > 1 && (
                    <p className="text-sm text-muted-foreground">
                      ou {course.max_installments}x de {formatCurrency(course.price_cents / course.max_installments)}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-border/50 pt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Acesso imediato após confirmação</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Garantia de 7 dias</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Suporte exclusivo via WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Payment Button (Stripe integration placeholder) */}
            <div className="space-y-4">
              <Button 
                onClick={handlePayment}
                className="w-full btn-cta py-6 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processando pagamento...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pagar {formatCurrency(course.price_cents)}
                  </>
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Pagamento 100% seguro. Seus dados estão protegidos.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Acesso */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-fade-in text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-primary" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-display font-bold text-foreground">
                Parabéns! Você está dentro! 🎉
              </h1>
              <p className="text-muted-foreground">
                Sua matrícula foi confirmada. Aqui estão seus dados de acesso:
              </p>
            </div>

            {/* Access Credentials */}
            <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-4 max-w-md mx-auto text-left">
              <div className="space-y-2">
                <Label className="text-muted-foreground">E-mail</Label>
                <div className="p-3 bg-muted/50 rounded-lg font-mono text-foreground">
                  {leadData.email}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Senha provisória</Label>
                <div className="p-3 bg-muted/50 rounded-lg font-mono text-foreground">
                  {temporaryPassword}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Enviamos esses dados para o seu e-mail também. Recomendamos trocar sua senha no primeiro acesso.
              </p>
            </div>

            <Button 
              onClick={handleAccessCourse}
              className="btn-cta py-6 text-lg px-12"
            >
              Acessar Área do Aluno
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
