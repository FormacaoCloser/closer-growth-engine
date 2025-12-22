import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, CheckCircle, Users, TrendingUp, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            <div className="font-display text-xl font-bold">
              <span className="text-gradient">Formação</span> Closer
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#beneficios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Benefícios
              </a>
              <a href="#depoimentos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Depoimentos
              </a>
              <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </a>
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <Link to={isAdmin() ? "/admin" : "/aluno"}>
                  <Button>
                    {isAdmin() ? "Painel Admin" : "Área do Aluno"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" className="hidden sm:flex">
                      Entrar
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button>
                      Começar agora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="container-narrow relative">
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm text-primary font-medium">
                Vagas limitadas para a próxima turma
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Torne-se um{" "}
              <span className="text-gradient">Closer de Alta Performance</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Domine a arte de fechar vendas de alto valor e transforme sua carreira comercial com técnicas comprovadas pelos melhores closers do mercado.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="btn-cta h-14 text-lg px-8">
                <PlayCircle className="mr-2 h-5 w-5" />
                Assistir aula gratuita
              </Button>
              <Button size="lg" variant="outline" className="h-14 text-lg px-8">
                Conhecer o método
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Acesso vitalício</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Suporte exclusivo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Certificado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 border-y border-border/50">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="font-display text-4xl font-bold text-gradient mb-2">+500</div>
              <p className="text-muted-foreground">Alunos formados</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="font-display text-4xl font-bold text-gradient mb-2">R$2M+</div>
              <p className="text-muted-foreground">Em vendas fechadas</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="font-display text-4xl font-bold text-gradient mb-2">98%</div>
              <p className="text-muted-foreground">Taxa de satisfação</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="font-display text-4xl font-bold text-gradient mb-2">4.9</div>
              <p className="text-muted-foreground">Avaliação média</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="py-20 lg:py-32">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              O que você vai aprender
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Um método completo para você dominar a arte do fechamento e multiplicar seus resultados.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-gradient group hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">
                Técnicas de Fechamento
              </h3>
              <p className="text-muted-foreground">
                Aprenda as técnicas mais avançadas de fechamento utilizadas pelos top closers do mercado.
              </p>
            </div>

            <div className="card-gradient group hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-6 group-hover:bg-secondary/30 transition-colors">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">
                Leitura de Perfil
              </h3>
              <p className="text-muted-foreground">
                Entenda como identificar o perfil do seu lead e adaptar sua abordagem para maximizar conversões.
              </p>
            </div>

            <div className="card-gradient group hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-6 group-hover:bg-accent/30 transition-colors">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">
                Escalabilidade
              </h3>
              <p className="text-muted-foreground">
                Descubra como escalar suas vendas e aumentar seu ticket médio de forma consistente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        
        <div className="container-narrow relative text-center">
          <h2 className="font-display text-3xl lg:text-5xl font-bold mb-6">
            Pronto para transformar sua carreira?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Junte-se a centenas de closers que já estão faturando alto com o método Formação Closer.
          </p>
          
          <Link to="/auth">
            <Button size="lg" className="btn-cta h-14 text-lg px-10">
              Quero me inscrever agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <p className="mt-6 text-sm text-muted-foreground">
            Garantia de 7 dias ou seu dinheiro de volta
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="font-display text-lg font-bold">
              <span className="text-gradient">Formação</span> Closer
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2024 Formação Closer. Todos os direitos reservados.
            </p>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Termos</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
              <a href="#" className="hover:text-foreground transition-colors">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}