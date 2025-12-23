import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Termos de Uso</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Termos de Uso
          </h1>
          <p className="text-muted-foreground mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">1. Identificação da Empresa</h2>
              <p>
                Este site e a plataforma "Formação Closer" são operados por empresa inscrita no CNPJ nº <strong className="text-foreground">58.551.196/0001-92</strong>, 
                com sede no Brasil, doravante denominada simplesmente "Formação Closer" ou "nós".
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">2. Aceitação dos Termos</h2>
              <p>
                Ao acessar e utilizar este site, plataforma ou qualquer serviço oferecido pela Formação Closer, 
                você concorda integralmente com estes Termos de Uso. Caso não concorde com alguma disposição, 
                solicitamos que não utilize nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">3. Descrição dos Serviços</h2>
              <p>
                A Formação Closer oferece cursos online, materiais educacionais e treinamentos voltados para 
                a formação de profissionais de vendas (closers). Os serviços incluem:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Acesso a videoaulas e conteúdos gravados</li>
                <li>Materiais de apoio em formato digital</li>
                <li>Acesso a comunidade de alunos</li>
                <li>Suporte ao aluno durante o período de acesso</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">4. Cadastro e Conta do Usuário</h2>
              <p>
                Para acessar determinados serviços, é necessário criar uma conta. Você se compromete a:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Fornecer informações verdadeiras, completas e atualizadas</li>
                <li>Manter a confidencialidade de suas credenciais de acesso</li>
                <li>Notificar imediatamente qualquer uso não autorizado de sua conta</li>
                <li>Ser responsável por todas as atividades realizadas em sua conta</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">5. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo disponibilizado na plataforma, incluindo mas não se limitando a textos, 
                vídeos, imagens, gráficos, logotipos, marcas e materiais didáticos, são de propriedade 
                exclusiva da Formação Closer ou licenciados para uso.
              </p>
              <p className="mt-2">
                É expressamente proibido:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Copiar, reproduzir ou distribuir qualquer conteúdo sem autorização prévia</li>
                <li>Compartilhar credenciais de acesso com terceiros</li>
                <li>Gravar, capturar ou fazer download não autorizado das aulas</li>
                <li>Utilizar o conteúdo para fins comerciais sem autorização expressa</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">6. Responsabilidades do Usuário</h2>
              <p>O usuário se compromete a:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Utilizar a plataforma de forma ética e respeitosa</li>
                <li>Não praticar atos que possam prejudicar outros usuários ou a plataforma</li>
                <li>Respeitar os direitos autorais e de propriedade intelectual</li>
                <li>Manter comportamento adequado nas interações com outros alunos e equipe</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">7. Pagamentos e Reembolso</h2>
              <p>
                Os valores, formas de pagamento e condições de parcelamento são apresentados no momento 
                da compra. Em caso de pagamento via cartão de crédito, o processamento é realizado por 
                intermediadores de pagamento homologados.
              </p>
              <p className="mt-2">
                O prazo para solicitação de reembolso é de <strong className="text-foreground">7 (sete) dias corridos</strong> a partir 
                da data da compra, conforme previsto no Código de Defesa do Consumidor (Art. 49). 
                Após esse prazo, não será possível solicitar estorno.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">8. Limitações de Responsabilidade</h2>
              <p>
                A Formação Closer não garante resultados específicos decorrentes do uso de seus serviços. 
                O sucesso profissional depende de diversos fatores, incluindo dedicação, aplicação prática 
                e condições de mercado.
              </p>
              <p className="mt-2">
                Não nos responsabilizamos por:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Interrupções temporárias no acesso à plataforma por motivos técnicos</li>
                <li>Decisões profissionais ou financeiras tomadas com base nos conteúdos</li>
                <li>Problemas de conexão à internet do usuário</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">9. Cancelamento e Rescisão</h2>
              <p>
                Reservamo-nos o direito de suspender ou cancelar o acesso de usuários que violarem estes 
                Termos de Uso, sem direito a reembolso proporcional, especialmente em casos de:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Compartilhamento de credenciais de acesso</li>
                <li>Pirataria ou distribuição não autorizada de conteúdo</li>
                <li>Comportamento inadequado ou desrespeitoso</li>
                <li>Fraude ou tentativa de fraude</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">10. Alterações nos Termos</h2>
              <p>
                Estes Termos de Uso podem ser alterados a qualquer momento. Notificaremos os usuários 
                sobre mudanças significativas através do e-mail cadastrado ou por aviso na plataforma. 
                O uso continuado após as alterações implica aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">11. Legislação Aplicável e Foro</h2>
              <p>
                Estes Termos de Uso são regidos pela legislação brasileira. Fica eleito o foro da 
                comarca do domicílio do consumidor para dirimir quaisquer controvérsias, conforme 
                previsto no Código de Defesa do Consumidor.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">12. Contato</h2>
              <p>
                Para dúvidas sobre estes Termos de Uso, entre em contato através da nossa{' '}
                <Link to="/contato" className="text-primary hover:underline">página de contato</Link>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
