import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="secondary" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
          </div>

          <Card className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-10 h-10 text-primary-600 dark:text-primary-400" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Termos de Uso
                </h1>
                <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                  Última atualização: {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="lead text-gray-600 dark:text-gray-400">
                Bem-vindo ao MN Studio. Ao acessar e usar nossa plataforma, você concorda com os seguintes termos e condições. 
                Por favor, leia-os cuidadosamente.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 dark:text-white">
                1. Aceitação dos Termos
              </h2>
              <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                Ao acessar ou usar o MN Studio, você concorda em cumprir e estar vinculado a estes Termos de Uso e nossa Política de Privacidade. 
                Se você não concordar com alguma parte destes termos, não deve usar nossa plataforma.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 dark:text-white">
                2. Descrição do Serviço
              </h2>
              <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                O MN Studio é uma plataforma online que oferece acesso a mangás, manhwas, manhuas e light novels (novels). 
                Fornecemos um ambiente onde usuários podem ler e acompanhar suas histórias favoritas gratuitamente.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 dark:text-white">
                3. Cadastro e Conta de Usuário
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3 dark:text-white">
                3.1 Requisitos de Cadastro
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Você deve ter pelo menos 13 anos de idade para criar uma conta</li>
                <li>As informações fornecidas devem ser precisas e atualizadas</li>
                <li>Você é responsável por manter a confidencialidade de sua senha</li>
                <li>Você é responsável por todas as atividades que ocorrem em sua conta</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3 dark:text-white">
                3.2 Segurança da Conta
              </h3>
              <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                Você concorda em notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta ou qualquer outra violação de segurança.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 dark:text-white">
                4. Uso Aceitável
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3 dark:text-gray-300">
                Ao usar o MN Studio, você concorda em NÃO:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Violar qualquer lei local, estadual, nacional ou internacional</li>
                <li>Transmitir ou compartilhar conteúdo ofensivo, difamatório ou ilegal</li>
                <li>Fazer upload de vírus, malware ou qualquer código malicioso</li>
                <li>Tentar obter acesso não autorizado a qualquer parte do serviço</li>
                <li>Usar o serviço para fins comerciais sem autorização expressa</li>
                <li>Copiar, modificar ou distribuir o conteúdo da plataforma sem permissão</li>
                <li>Fazer scraping ou usar bots para acessar o conteúdo</li>
                <li>Assediar, intimidar ou ameaçar outros usuários</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 dark:text-white">
                5. Conteúdo
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3 dark:text-white">
                5.1 Propriedade Intelectual
              </h3>
              <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                Todo o conteúdo disponível no MN Studio, incluindo mas não se limitando a textos, gráficos, logos, ícones, imagens, 
                clipes de áudio, downloads digitais e compilações de dados, é propriedade do MN Studio ou de seus fornecedores de conteúdo 
                e é protegido por leis de direitos autorais internacionais.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3 dark:text-white">
                5.2 Conteúdo do Usuário
              </h3>
              <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                Ao enviar conteúdo para nossa plataforma (como comentários ou avaliações), você concede ao MN Studio uma licença mundial, 
                não exclusiva, livre de royalties para usar, reproduzir, modificar e exibir esse conteúdo.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3 dark:text-white">
                5.3 Remoção de Conteúdo
              </h3>
              <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                Reservamo-nos o direito de remover qualquer conteúdo que viole estes termos ou que consideremos inadequado, 
                a nosso exclusivo critério, sem aviso prévio.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 dark:text-white">
                6. Direitos Autorais e DMCA
              </h2>
              <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                Respeitamos os direitos de propriedade intelectual de terceiros. Se você acredita que seu trabalho foi copiado de uma forma 
                que constitui violação de direitos autorais, por favor, entre em contato conosco em: <strong>copyright@mnstudio.com</strong>
              </p>
              <p className="text-gray-700 leading-relaxed mt-3 dark:text-gray-300">
                Sua notificação deve incluir:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Uma assinatura física ou eletrônica do proprietário dos direitos autorais</li>
                <li>Identificação da obra protegida por direitos autorais alegadamente violada</li>
                <li>Identificação do material que está sendo infringido</li>
                <li>Suas informações de contato</li>
                <li>Uma declaração de boa-fé de que o uso não é autorizado</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 dark:text-white">
                7. Limitação de Responsabilidade
              </h2>
              <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                O MN Studio é fornecido "como está" e "conforme disponível". Não garantimos que o serviço será ininterrupto, seguro ou livre de erros. 
                Em nenhuma circunstância seremos responsáveis por quaisquer danos diretos, indiretos, incidentais, especiais ou consequenciais 
                resultantes do uso ou da incapacidade de usar nosso serviço.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 dark:text-white">
                8. Modificações do Serviço
              </h2>
              <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                Reservamo-nos o direito de modificar ou descontinuar, temporária ou permanentemente, o serviço (ou qualquer parte dele) 
                com ou sem aviso prévio. Não seremos responsáveis perante você ou terceiros por qualquer modificação, suspensão ou descontinuação do serviço.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 dark:text-white">
                9. Término
              </h2>
              <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                Podemos encerrar ou suspender sua conta e acesso ao serviço imediatamente, sem aviso prévio ou responsabilidade, 
                por qualquer motivo, incluindo, sem limitação, se você violar os Termos de Uso.
              </p>
              <p className="text-gray-700 leading-relaxed mt-3 dark:text-gray-300">
                Após o término, seu direito de usar o serviço cessará imediatamente. 
                Se você deseja encerrar sua conta, pode simplesmente descontinuar o uso do serviço.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 dark:text-white">
                10. Links para Sites de Terceiros
              </h2>
              <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                Nosso serviço pode conter links para sites ou serviços de terceiros que não são de propriedade ou controlados pelo MN Studio. 
                Não temos controle sobre e não assumimos responsabilidade pelo conteúdo, políticas de privacidade ou práticas de sites ou serviços de terceiros.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 dark:text-white">
                11. Alterações aos Termos
              </h2>
              <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. 
                Se uma revisão for material, tentaremos fornecer um aviso com pelo menos 30 dias de antecedência antes de quaisquer novos termos entrarem em vigor. 
                O que constitui uma mudança material será determinado a nosso exclusivo critério.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 dark:text-white">
                12. Lei Aplicável
              </h2>
              <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar suas disposições sobre conflito de leis.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 dark:text-white">
                13. Contato
              </h2>
              <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                Se você tiver alguma dúvida sobre estes Termos de Uso, entre em contato conosco:
              </p>
              <ul className="list-none pl-0 space-y-2 text-gray-700 mt-3 dark:text-gray-300">
                <li><strong>Email:</strong> suporte@mnstudio.com</li>
                <li><strong>Website:</strong> www.mnstudio.com</li>
              </ul>

              <div className="mt-12 p-6 bg-primary-50 border-l-4 border-primary-600 rounded dark:bg-primary-900 dark:border-primary-400">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Nota Importante:</strong> Ao continuar a usar o MN Studio após alterações nestes Termos de Uso, 
                  você concorda em ficar vinculado aos termos revisados. Se você não concordar com os novos termos, 
                  você não está mais autorizado a usar o MN Studio.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terms;