import { MessageCircleQuestion } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CMSContent, getCMSValue, getCMSJson } from '@/hooks/useCMSContent';
import { getIcon } from '@/lib/iconMap';

interface ObjectionItem {
  question: string;
  answer: string;
  icon: string;
  highlight: string;
}

const defaultObjections: ObjectionItem[] = [
  {
    question: 'Não tenho experiência com vendas. Consigo?',
    answer: 'Sim! A maioria dos closers de sucesso começou do zero. A formação te prepara com tudo que você precisa, mesmo sem nunca ter vendido nada.',
    icon: 'Target',
    highlight: 'do zero',
  },
  {
    question: 'Não sei se tenho perfil de vendedor',
    answer: 'Closer não é aquele vendedor chato. É um consultor que ajuda pessoas a tomarem decisões. Se você gosta de conversar e resolver problemas, você tem o perfil.',
    icon: 'User',
    highlight: 'consultor',
  },
  {
    question: 'Tenho medo de ligar para estranhos',
    answer: 'Normal! Todo mundo tem no começo. A formação te prepara com scripts e simulações até você se sentir confiante. Medo vira habilidade com prática.',
    icon: 'Phone',
    highlight: 'scripts e simulações',
  },
  {
    question: 'E se eu não conseguir clientes?',
    answer: 'Como closer contratado, você não precisa prospectar. A empresa te envia leads qualificados. Seu trabalho é converter, não caçar clientes.',
    icon: 'Users',
    highlight: 'leads qualificados',
  },
  {
    question: 'Preciso investir muito para começar?',
    answer: 'Zero investimento em estrutura. Você só precisa de um computador, internet e um telefone. Nada de escritório, estoque ou funcionários.',
    icon: 'Wallet',
    highlight: 'Zero investimento',
  },
  {
    question: 'Quanto tempo até eu conseguir uma vaga?',
    answer: 'Closers dedicados conseguem suas primeiras entrevistas em poucas semanas. O tempo exato depende do seu comprometimento, mas não estamos falando de anos.',
    icon: 'Clock',
    highlight: 'poucas semanas',
  },
  {
    question: 'Não tenho boa dicção ou comunicação',
    answer: 'Comunicação é técnica, não dom. Você vai aprender exatamente o que falar e como falar. Scripts prontos te guiam no começo até você ganhar confiança.',
    icon: 'Mic',
    highlight: 'técnica',
  },
  {
    question: 'Já tentei vender antes e não funcionou',
    answer: 'Provavelmente você usou o método errado. Vender como closer é diferente - você conduz a conversa com estrutura e psicologia de vendas.',
    icon: 'RefreshCw',
    highlight: 'método errado',
  },
  {
    question: 'Isso funciona mesmo no Brasil?',
    answer: 'O mercado de vendas consultivas no Brasil está aquecido. Startups, SaaS e empresas de todos os tamanhos estão contratando closers qualificados.',
    icon: 'Globe',
    highlight: 'aquecido',
  },
  {
    question: 'É só pra vender produto caro (high ticket)?',
    answer: 'Não! Closers trabalham em diversos mercados - SaaS, consultorias, infoprodutos, serviços. O importante é a venda consultiva, não o valor do ticket.',
    icon: 'Shield',
    highlight: 'diversos mercados',
  },
  {
    question: 'É CLT ou preciso ser MEI/PJ?',
    answer: 'A maioria das vagas é CLT ou PJ com contrato formal. Você escolhe o modelo que preferir. Salário fixo + comissão é o padrão do mercado.',
    icon: 'FileText',
    highlight: 'CLT ou PJ',
  },
  {
    question: 'Posso fazer transição de carreira?',
    answer: 'Totalmente! Muitas empresas contratam pessoas de outras áreas. O que importa é seu perfil consultivo e vontade de aprender, não sua experiência anterior.',
    icon: 'Calendar',
    highlight: 'outras áreas',
  },
  {
    question: 'Quanto um closer ganha realisticamente?',
    answer: 'Salário base de R$ 3k a R$ 8k + comissões que podem triplicar esse valor. Closers experientes ganham de R$ 15k a R$ 30k/mês. Depende da empresa e do seu desempenho.',
    icon: 'TrendingUp',
    highlight: 'R$ 3k a R$ 8k',
  },
  {
    question: 'E se eu não bater a meta?',
    answer: 'A maioria das empresas tem período de rampagem (3-6 meses) onde a meta é menor. Você aprende ganhando, sem a pressão de entregar 100% desde o dia um.',
    icon: 'Target',
    highlight: 'período de rampagem',
  },
  {
    question: 'Precisa ter experiência em vendas B2B?',
    answer: 'Não! A formação te prepara do zero. Empresas valorizam perfil consultivo e coachability (capacidade de aprender), não currículo extenso.',
    icon: 'User',
    highlight: 'perfil consultivo',
  },
  {
    question: 'Vou precisar aparecer ou gravar vídeos?',
    answer: 'Não! Closer trabalha nos bastidores. Seu trabalho é por ligação, call ou WhatsApp. Zero exposição pública necessária.',
    icon: 'Video',
    highlight: 'nos bastidores',
  },
];

interface ObjectionsSectionProps {
  content?: CMSContent[];
}

export function ObjectionsSection({ content }: ObjectionsSectionProps) {
  // Get CMS values with fallbacks
  const badge = getCMSValue(content, 'faq_badge', 'Dúvidas Comuns');
  const title = getCMSValue(content, 'faq_title', 'Será que <span class="text-gradient-accent">eu consigo</span>?');
  const subtitle = getCMSValue(content, 'faq_subtitle', 'Clique nas perguntas abaixo para ver as respostas');
  const objections = getCMSJson<ObjectionItem[]>(content, 'faq_items', defaultObjections);

  // Split objections into two columns
  const leftColumn = objections.filter((_, i) => i % 2 === 0);
  const rightColumn = objections.filter((_, i) => i % 2 === 1);

  const renderAccordionItem = (objection: ObjectionItem, index: number, columnOffset: number) => {
    const Icon = getIcon(objection.icon);
    const answerId = `item-${columnOffset + index}`;
    
    // Highlight the keyword in the answer
    const highlightedAnswer = objection.answer.replace(
      objection.highlight,
      `<span class="text-primary font-semibold">${objection.highlight}</span>`
    );

    return (
      <AccordionItem
        key={index}
        value={answerId}
        className="border border-border/50 rounded-xl px-5 py-1 bg-card/50 hover:bg-card/80 transition-colors data-[state=open]:bg-card data-[state=open]:border-primary/30"
      >
        <AccordionTrigger className="hover:no-underline py-4 gap-4">
          <div className="flex items-center gap-4 text-left">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-base font-semibold text-foreground leading-tight">
              {objection.question}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-5 pl-14 pr-2">
          <p 
            className="text-muted-foreground leading-relaxed text-sm"
            dangerouslySetInnerHTML={{ __html: highlightedAnswer }}
          />
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
            <MessageCircleQuestion className="w-4 h-4 text-accent" />
            <span className="text-sm text-accent font-medium">{badge}</span>
          </div>
          <h2 
            className="text-3xl md:text-4xl font-display font-bold text-foreground"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            {subtitle}
          </p>
        </div>

        {/* Two Column Accordion Layout */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Left Column */}
          <Accordion type="single" collapsible className="space-y-3">
            {leftColumn.map((objection, index) => renderAccordionItem(objection, index, 0))}
          </Accordion>

          {/* Right Column */}
          <Accordion type="single" collapsible className="space-y-3">
            {rightColumn.map((objection, index) => renderAccordionItem(objection, index, leftColumn.length))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
