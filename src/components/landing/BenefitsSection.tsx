import { Home, Clock, DollarSign, TrendingUp, GraduationCap, Rocket } from 'lucide-react';

const benefits = [
  {
    icon: Home,
    title: 'Home Office',
    description: 'Trabalhe de qualquer lugar do mundo, só precisa de um computador e internet.',
  },
  {
    icon: Clock,
    title: '~4 Horas por Dia',
    description: 'Jornada flexível, sem bater ponto. Você decide seus horários.',
  },
  {
    icon: DollarSign,
    title: 'R$10-30k/mês',
    description: 'Ganhos reais de closers no mercado brasileiro. Comissões atrativas.',
  },
  {
    icon: TrendingUp,
    title: 'Mercado em Alta',
    description: 'Demanda crescente por profissionais qualificados. Empresas precisam de você.',
  },
  {
    icon: GraduationCap,
    title: 'Sem Faculdade',
    description: 'Não precisa de diploma. O que vale é resultado, não papel na parede.',
  },
  {
    icon: Rocket,
    title: 'Rápido para Começar',
    description: 'Em poucas semanas você pode estar fazendo suas primeiras vendas.',
  },
];

export function BenefitsSection() {
  return (
    <section className="py-20 px-4 bg-card/50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Por que virar um <span className="text-gradient">Closer</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Uma profissão que está transformando a vida de milhares de jovens no Brasil.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
