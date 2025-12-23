import { 
  MessageCircleQuestion, 
  Target, 
  User, 
  Phone, 
  Users, 
  Wallet, 
  Clock, 
  Mic, 
  RefreshCw, 
  Globe, 
  Shield, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Video 
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const objections = [
  {
    question: 'Não tenho experiência com vendas. Consigo?',
    answer: 'Sim! A maioria dos closers de sucesso começou do zero. Você vai aprender técnicas comprovadas que funcionam mesmo para quem nunca vendeu nada na vida.',
    icon: Target,
    highlight: 'do zero',
  },
  {
    question: 'Não sei se tenho perfil de vendedor',
    answer: 'Closer não é aquele vendedor chato. É um consultor que ajuda pessoas a tomarem decisões. Se você gosta de conversar e resolver problemas, você tem o perfil.',
    icon: User,
    highlight: 'consultor',
  },
  {
    question: 'Tenho medo de ligar para estranhos',
    answer: 'Normal! Todo mundo tem no começo. A formação te prepara com scripts e simulações até você se sentir confiante. Medo vira habilidade com prática.',
    icon: Phone,
    highlight: 'scripts e simulações',
  },
  {
    question: 'E se eu não conseguir clientes?',
    answer: 'Como closer, você não precisa prospectar. Empresas te contratam e enviam leads qualificados. Seu trabalho é converter, não caçar clientes.',
    icon: Users,
    highlight: 'leads qualificados',
  },
  {
    question: 'Preciso investir muito para começar?',
    answer: 'Zero investimento em estrutura. Você só precisa de um computador, internet e um telefone. Nada de escritório, estoque ou funcionários.',
    icon: Wallet,
    highlight: 'Zero investimento',
  },
  {
    question: 'Quanto tempo até eu começar a ganhar dinheiro?',
    answer: 'Closers dedicados começam a fechar vendas em poucas semanas. O tempo exato depende do seu comprometimento, mas não estamos falando de anos.',
    icon: Clock,
    highlight: 'poucas semanas',
  },
  {
    question: 'Não tenho boa dicção ou comunicação',
    answer: 'Comunicação é técnica, não dom. Você vai aprender exatamente o que falar e como falar. Scripts prontos te guiam no começo até você ganhar confiança.',
    icon: Mic,
    highlight: 'técnica',
  },
  {
    question: 'Já tentei vender antes e não funcionou',
    answer: 'Provavelmente você usou o método errado. Vender como closer é diferente - você conduz a conversa com estrutura e psicologia de vendas.',
    icon: RefreshCw,
    highlight: 'método errado',
  },
  {
    question: 'Isso funciona mesmo no Brasil?',
    answer: 'O mercado de high ticket no Brasil está em explosão. Empresas brasileiras estão desesperadas por closers qualificados. A demanda supera a oferta.',
    icon: Globe,
    highlight: 'explosão',
  },
  {
    question: 'E se a empresa não me pagar a comissão?',
    answer: 'Você aprende a se proteger com contrato, termos claros e como escolher empresas sérias. Calote existe, mas é evitável com as práticas certas.',
    icon: Shield,
    highlight: 'contrato',
  },
  {
    question: 'Preciso ter CNPJ ou ser MEI?',
    answer: 'Não para começar! Muitos closers recebem como pessoa física via Pix. Quando escalar, aí sim vale abrir MEI para organizar melhor.',
    icon: FileText,
    highlight: 'pessoa física',
  },
  {
    question: 'Consigo fazer isso sem largar meu emprego?',
    answer: 'Totalmente! Muitos closers trabalham em horários flexíveis - noite, fins de semana. Você monta sua própria agenda conforme sua disponibilidade.',
    icon: Calendar,
    highlight: 'horários flexíveis',
  },
  {
    question: 'Quanto um closer ganha realisticamente?',
    answer: 'Varia muito: iniciantes faturam R$ 3k a R$ 8k/mês. Intermediários R$ 10k a R$ 20k. Tops passam de R$ 30k. Depende do seu esforço e nicho escolhido.',
    icon: TrendingUp,
    highlight: 'R$ 3k a R$ 8k',
  },
  {
    question: 'Vou precisar aparecer ou gravar vídeos?',
    answer: 'Não! Closer trabalha nos bastidores. Seu trabalho é por ligação, call ou WhatsApp. Zero exposição pública necessária.',
    icon: Video,
    highlight: 'nos bastidores',
  },
];

export function ObjectionsSection() {
  // Split objections into two columns
  const leftColumn = objections.filter((_, i) => i % 2 === 0);
  const rightColumn = objections.filter((_, i) => i % 2 === 1);

  const renderAccordionItem = (objection: typeof objections[0], index: number) => {
    const Icon = objection.icon;
    const answerId = `item-${objections.indexOf(objection)}`;
    
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
            <span className="text-sm text-accent font-medium">Dúvidas Comuns</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Será que <span className="text-gradient-accent">eu consigo</span>?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            Clique nas perguntas abaixo para ver as respostas
          </p>
        </div>

        {/* Two Column Accordion Layout */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Left Column */}
          <Accordion type="single" collapsible className="space-y-3">
            {leftColumn.map((objection, index) => renderAccordionItem(objection, index))}
          </Accordion>

          {/* Right Column */}
          <Accordion type="single" collapsible className="space-y-3">
            {rightColumn.map((objection, index) => renderAccordionItem(objection, index))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
