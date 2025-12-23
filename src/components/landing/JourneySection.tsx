import { 
  Sprout, 
  BookOpen, 
  Target, 
  Theater, 
  Briefcase, 
  Rocket,
  ChevronRight,
  MapPin
} from 'lucide-react';

const journeySteps = [
  {
    step: 1,
    title: 'Zero',
    subtitle: 'Ponto de partida',
    description: 'Onde você está agora - sem experiência, cheio de dúvidas, mas com vontade de mudar.',
    icon: Sprout,
    color: 'from-muted to-muted-foreground/50',
    isStart: true,
  },
  {
    step: 2,
    title: 'Fundamentos',
    subtitle: 'Mentalidade certa',
    description: 'Mindset de vendas, como pensa um closer, psicologia do comprador e do vendedor.',
    icon: BookOpen,
    color: 'from-primary/60 to-primary/80',
  },
  {
    step: 3,
    title: 'Técnicas',
    subtitle: 'Arsenal completo',
    description: 'Scripts de abertura, condução da conversa, quebra de objeções e fechamento.',
    icon: Target,
    color: 'from-primary/80 to-primary',
  },
  {
    step: 4,
    title: 'Prática',
    subtitle: 'Mão na massa',
    description: 'Simulações ao vivo, roleplay com feedback, análise de casos reais do mercado.',
    icon: Theater,
    color: 'from-primary to-accent/80',
  },
  {
    step: 5,
    title: 'Portfólio',
    subtitle: 'Seu diferencial',
    description: 'Montagem do seu perfil profissional, cases de sucesso e posicionamento no mercado.',
    icon: Briefcase,
    color: 'from-accent/80 to-accent',
  },
  {
    step: 6,
    title: 'Contratado',
    subtitle: 'Meta alcançada',
    description: 'Como se candidatar, entrevistas assertivas e conquistar sua primeira vaga de closer.',
    icon: Rocket,
    color: 'from-accent to-chart-1',
    isEnd: true,
  },
];

export function JourneySection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-card/30">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Sua Jornada</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            O que você vai <span className="text-gradient">aprender</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Do zero absoluto ao closer contratado - uma jornada estruturada passo a passo
          </p>
        </div>

        {/* Desktop Timeline - Horizontal */}
        <div className="hidden lg:block relative">
          {/* Connection Line */}
          <div className="absolute top-[60px] left-[8%] right-[8%] h-1 bg-gradient-to-r from-muted via-primary to-accent rounded-full" />
          
          {/* Steps */}
          <div className="grid grid-cols-6 gap-4">
            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative flex flex-col items-center group">
                  {/* Step Number & Icon */}
                  <div className={`relative z-10 w-[120px] h-[120px] rounded-2xl bg-gradient-to-br ${step.color} p-[2px] shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full rounded-2xl bg-card flex flex-col items-center justify-center gap-2">
                      <Icon className="w-8 h-8 text-foreground" />
                      <span className="text-xs font-bold text-muted-foreground">PASSO {step.step}</span>
                    </div>
                  </div>
                  
                  {/* You are here indicator */}
                  {step.isStart && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full animate-pulse">
                      Você está aqui
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="mt-6 text-center">
                    <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                    <p className="text-xs text-primary font-medium mb-2">{step.subtitle}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-[150px]">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Arrow to next (except last) */}
                  {index < journeySteps.length - 1 && (
                    <ChevronRight className="absolute top-[52px] -right-4 w-6 h-6 text-primary/50 z-20" />
                  )}
                  
                  {/* Goal badge */}
                  {step.isEnd && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full">
                      🎯 Meta
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Timeline - Vertical */}
        <div className="lg:hidden relative">
          {/* Vertical Line */}
          <div className="absolute top-0 bottom-0 left-[30px] w-1 bg-gradient-to-b from-muted via-primary to-accent rounded-full" />
          
          {/* Steps */}
          <div className="space-y-8">
            {journeySteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative flex items-start gap-5 pl-2">
                  {/* Step Icon */}
                  <div className={`relative z-10 flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} p-[2px] shadow-md`}>
                    <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                      <Icon className="w-6 h-6 text-foreground" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {step.step}
                      </span>
                      {step.isStart && (
                        <span className="text-xs font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded animate-pulse">
                          Você está aqui
                        </span>
                      )}
                      {step.isEnd && (
                        <span className="text-xs font-bold text-accent-foreground bg-accent px-2 py-0.5 rounded">
                          🎯 Meta
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-foreground">{step.title}</h3>
                    <p className="text-xs text-primary font-medium mb-1">{step.subtitle}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA hint */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            Cada módulo foi desenhado para te levar ao próximo nível.{' '}
            <span className="text-primary font-semibold">Sem enrolação, só prática.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
