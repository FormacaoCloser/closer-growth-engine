import { useState } from 'react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Link } from 'react-router-dom';
import { ChevronRight, Mail, MessageCircle, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "E-mail inválido",
        description: "Por favor, insira um endereço de e-mail válido.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save contact message as a lead
      const { error } = await supabase.from('leads').insert({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        source: 'contact_form',
        phone: null
      });

      if (error) throw error;

      toast({
        title: "Mensagem enviada!",
        description: "Recebemos sua mensagem. Responderemos em até 24 horas úteis.",
      });

      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro. Tente novamente ou entre em contato via WhatsApp.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Contato</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Entre em Contato
          </h1>
          <p className="text-muted-foreground mb-12 max-w-2xl">
            Tem alguma dúvida sobre a Formação Closer? Nossa equipe está pronta para ajudar. 
            Preencha o formulário ou use um de nossos canais de atendimento.
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-card/50 border border-border/50 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">Envie uma mensagem</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    maxLength={255}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input 
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Sobre o que você quer falar?"
                    maxLength={150}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea 
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Escreva sua mensagem..."
                    rows={5}
                    maxLength={1000}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Enviando...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              {/* Channels */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-6">Canais de Atendimento</h2>
                
                <div className="space-y-4">
                  <a 
                    href="mailto:contato@formacaocloser.com.br"
                    className="flex items-start gap-4 p-4 bg-card/50 border border-border/50 rounded-xl hover:border-primary/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">E-mail</h3>
                      <p className="text-sm text-muted-foreground">contato@formacaocloser.com.br</p>
                    </div>
                  </a>

                  <a 
                    href="https://wa.me/5511999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 p-4 bg-card/50 border border-border/50 rounded-xl hover:border-primary/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">WhatsApp</h3>
                      <p className="text-sm text-muted-foreground">Atendimento rápido para dúvidas</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Response Time */}
              <div className="flex items-start gap-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Tempo de Resposta</h3>
                  <p className="text-sm text-muted-foreground">
                    Respondemos em até 24 horas úteis. Para urgências, use o WhatsApp.
                  </p>
                </div>
              </div>

              {/* Company Info */}
              <div className="pt-6 border-t border-border/50">
                <h2 className="text-xl font-semibold text-foreground mb-4">Informações da Empresa</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong className="text-foreground">CNPJ:</strong> 58.551.196/0001-92</p>
                  <p className="text-sm">
                    Formação Closer - Plataforma de ensino de vendas consultivas
                  </p>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="p-4 bg-card/50 border border-border/50 rounded-xl">
                <h3 className="font-medium text-foreground mb-2">Perguntas Frequentes</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Muitas dúvidas já foram respondidas na nossa página principal.
                </p>
                <Button variant="outline" asChild size="sm">
                  <Link to="/#faq">Ver FAQ</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
