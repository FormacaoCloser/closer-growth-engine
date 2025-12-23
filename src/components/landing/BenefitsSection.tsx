import { Home, Clock, DollarSign, TrendingUp, GraduationCap, Rocket } from 'lucide-react';
import { CMSContent, getCMSValue, getCMSJson } from '@/hooks/useCMSContent';
import { getIcon } from '@/lib/iconMap';

interface BenefitItem {
  icon: string;
  title: string;
  description: string;
}

const defaultBenefits: BenefitItem[] = [
  {
    icon: 'Home',
    title: 'Modelo Flexível',
    description: 'Vagas remotas, híbridas ou presenciais. Você escolhe o que combina com seu estilo.',
  },
  {
    icon: 'Clock',
    title: 'Carreira Sólida',
    description: 'Contrato CLT ou PJ com salário fixo + comissões. Estabilidade + potencial de ganhos.',
  },
  {
    icon: 'DollarSign',
    title: 'R$10-30k/mês',
    description: 'Salário base + comissões por performance. Quanto mais vende, mais ganha.',
  },
  {
    icon: 'TrendingUp',
    title: 'Mercado Aquecido',
    description: 'Startups, SaaS, consultorias - todas precisam de vendedores qualificados.',
  },
  {
    icon: 'GraduationCap',
    title: 'Sem Faculdade',
    description: 'O que importa é resultado. Empresas contratam por skill, não por diploma.',
  },
  {
    icon: 'Rocket',
    title: 'Alta Empregabilidade',
    description: 'Vagas abertas todo mês. A demanda por closers supera a oferta no Brasil.',
  },
];

interface BenefitsSectionProps {
  content?: CMSContent[];
}

export function BenefitsSection({ content }: BenefitsSectionProps) {
  // Get CMS values with fallbacks
  const title = getCMSValue(content, 'benefits_title', 'Por que virar um <span class="text-gradient">Closer</span>?');
  const subtitle = getCMSValue(content, 'benefits_subtitle', 'Uma profissão que está transformando a vida de milhares de jovens no Brasil.');
  const benefits = getCMSJson<BenefitItem[]>(content, 'benefits_items', defaultBenefits);

  return (
    <section className="py-20 px-4 bg-card/50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 
            className="text-3xl md:text-4xl font-display font-bold text-foreground"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = getIcon(benefit.icon);
            return (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
