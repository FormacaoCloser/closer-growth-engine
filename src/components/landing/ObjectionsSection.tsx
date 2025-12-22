import { MessageCircleQuestion, CheckCircle } from 'lucide-react';

const objections = [
  {
    question: 'Não tenho experiência com vendas. Consigo?',
    answer: 'Sim! A maioria dos closers de sucesso começou do zero. Você vai aprender técnicas comprovadas que funcionam mesmo para quem nunca vendeu nada na vida.',
  },
  {
    question: 'Não sei se tenho perfil de vendedor',
    answer: 'Closer não é aquele vendedor chato. É um consultor que ajuda pessoas a tomarem decisões. Se você gosta de conversar e resolver problemas, você tem o perfil.',
  },
  {
    question: 'Tenho medo de ligar para estranhos',
    answer: 'Normal! Todo mundo tem no começo. A formação te prepara com scripts e simulações até você se sentir confiante. Medo vira habilidade com prática.',
  },
  {
    question: 'E se eu não conseguir clientes?',
    answer: 'Como closer, você não precisa prospectar. Empresas te contratam e enviam leads qualificados. Seu trabalho é converter, não caçar clientes.',
  },
  {
    question: 'Preciso investir muito para começar?',
    answer: 'Zero investimento em estrutura. Você só precisa de um computador, internet e um telefone. Nada de escritório, estoque ou funcionários.',
  },
  {
    question: 'Quanto tempo até eu começar a ganhar dinheiro?',
    answer: 'Closers dedicados começam a fechar vendas em poucas semanas. O tempo exato depende do seu comprometimento, mas não estamos falando de anos.',
  },
];

export function ObjectionsSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
            <MessageCircleQuestion className="w-4 h-4 text-accent" />
            <span className="text-sm text-accent font-medium">Dúvidas Comuns</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Será que <span className="text-gradient-accent">eu consigo</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Essas são as perguntas que mais recebemos. Se você está se perguntando alguma delas, você não está sozinho.
          </p>
        </div>

        {/* Objections Grid */}
        <div className="space-y-4">
          {objections.map((objection, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {objection.question}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {objection.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
