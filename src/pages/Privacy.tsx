import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Política de Privacidade</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Política de Privacidade
          </h1>
          <p className="text-muted-foreground mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">1. Controlador dos Dados</h2>
              <p>
                A empresa inscrita no CNPJ nº <strong className="text-foreground">58.551.196/0001-92</strong>, operadora da plataforma 
                "Formação Closer", é a controladora dos dados pessoais coletados, nos termos da Lei Geral 
                de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">2. Dados Coletados</h2>
              <p>Coletamos os seguintes dados pessoais:</p>
              
              <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Dados fornecidos diretamente:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Nome completo</li>
                <li>Endereço de e-mail</li>
                <li>Número de telefone/WhatsApp</li>
                <li>Dados de pagamento (processados por intermediadores)</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Dados coletados automaticamente:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Endereço IP</li>
                <li>Dados de navegação (páginas visitadas, tempo de permanência)</li>
                <li>Tipo de dispositivo e navegador</li>
                <li>Dados de geolocalização aproximada</li>
                <li>Informações de cookies e tecnologias similares</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">3. Finalidade do Tratamento</h2>
              <p>Utilizamos seus dados para:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Processar sua matrícula e dar acesso aos cursos</li>
                <li>Enviar comunicações sobre o curso e seu progresso</li>
                <li>Fornecer suporte ao aluno</li>
                <li>Enviar novidades, ofertas e conteúdos educacionais (marketing)</li>
                <li>Melhorar nossos produtos e serviços</li>
                <li>Cumprir obrigações legais e regulatórias</li>
                <li>Prevenir fraudes e garantir a segurança da plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">4. Base Legal para Tratamento</h2>
              <p>O tratamento dos seus dados pessoais é realizado com base nas seguintes hipóteses legais (Art. 7º da LGPD):</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong className="text-foreground">Execução de contrato:</strong> para fornecer os serviços contratados</li>
                <li><strong className="text-foreground">Consentimento:</strong> para envio de comunicações de marketing</li>
                <li><strong className="text-foreground">Interesse legítimo:</strong> para melhorar nossos serviços e prevenir fraudes</li>
                <li><strong className="text-foreground">Cumprimento de obrigação legal:</strong> para atender requisitos fiscais e regulatórios</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">5. Compartilhamento de Dados</h2>
              <p>Seus dados podem ser compartilhados com:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong className="text-foreground">Processadores de pagamento:</strong> para processar transações financeiras</li>
                <li><strong className="text-foreground">Ferramentas de e-mail marketing:</strong> para envio de comunicações</li>
                <li><strong className="text-foreground">Ferramentas de análise:</strong> para entender o uso da plataforma</li>
                <li><strong className="text-foreground">Autoridades públicas:</strong> quando exigido por lei</li>
              </ul>
              <p className="mt-2">
                Não vendemos ou alugamos seus dados pessoais a terceiros para fins de marketing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">6. Retenção de Dados</h2>
              <p>
                Seus dados são mantidos pelo tempo necessário para cumprir as finalidades descritas 
                ou conforme exigido por lei:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong className="text-foreground">Dados de conta:</strong> enquanto a conta estiver ativa + 5 anos</li>
                <li><strong className="text-foreground">Dados de transação:</strong> 5 anos (obrigação fiscal)</li>
                <li><strong className="text-foreground">Dados de marketing:</strong> até revogação do consentimento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">7. Seus Direitos (Art. 18 da LGPD)</h2>
              <p>Você tem direito a:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong className="text-foreground">Confirmação e acesso:</strong> saber se tratamos seus dados e acessá-los</li>
                <li><strong className="text-foreground">Correção:</strong> corrigir dados incompletos ou desatualizados</li>
                <li><strong className="text-foreground">Anonimização ou eliminação:</strong> de dados desnecessários ou tratados em desconformidade</li>
                <li><strong className="text-foreground">Portabilidade:</strong> receber seus dados em formato estruturado</li>
                <li><strong className="text-foreground">Informação sobre compartilhamento:</strong> saber com quem compartilhamos seus dados</li>
                <li><strong className="text-foreground">Revogação de consentimento:</strong> retirar consentimento a qualquer momento</li>
                <li><strong className="text-foreground">Oposição:</strong> opor-se a tratamento baseado em interesse legítimo</li>
              </ul>
              <p className="mt-2">
                Para exercer esses direitos, entre em contato através da nossa{' '}
                <Link to="/contato" className="text-primary hover:underline">página de contato</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">8. Cookies e Tecnologias de Rastreamento</h2>
              <p>Utilizamos cookies e tecnologias similares para:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong className="text-foreground">Cookies essenciais:</strong> necessários para o funcionamento do site</li>
                <li><strong className="text-foreground">Cookies de performance:</strong> para entender como você usa o site</li>
                <li><strong className="text-foreground">Cookies de marketing:</strong> para exibir anúncios relevantes</li>
              </ul>
              <p className="mt-2">
                Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">9. Segurança dos Dados</h2>
              <p>
                Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Criptografia de dados em trânsito (HTTPS/SSL)</li>
                <li>Controle de acesso restrito a dados pessoais</li>
                <li>Monitoramento de segurança da plataforma</li>
                <li>Treinamento de equipe sobre proteção de dados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">10. Transferência Internacional</h2>
              <p>
                Alguns de nossos prestadores de serviço podem estar localizados fora do Brasil. 
                Nesses casos, garantimos que a transferência seja feita de acordo com a legislação 
                aplicável, utilizando cláusulas contratuais padrão ou outros mecanismos adequados.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">11. Alterações nesta Política</h2>
              <p>
                Esta Política de Privacidade pode ser atualizada periodicamente. Notificaremos você 
                sobre mudanças significativas através do e-mail cadastrado ou por aviso na plataforma. 
                Recomendamos revisar esta página periodicamente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">12. Contato do Encarregado (DPO)</h2>
              <p>
                Para questões relacionadas à privacidade e proteção de dados, incluindo exercício 
                dos seus direitos como titular, entre em contato através da nossa{' '}
                <Link to="/contato" className="text-primary hover:underline">página de contato</Link>.
              </p>
              <p className="mt-4">
                <strong className="text-foreground">CNPJ:</strong> 58.551.196/0001-92
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
