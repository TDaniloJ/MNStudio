import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Cookie, Database, Mail } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
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
              <Shield className="w-10 h-10 text-primary-600" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Política de Privacidade
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Última atualização: {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="lead text-gray-600">
                No MN Studio, levamos sua privacidade muito a sério. Esta Política de Privacidade explica como coletamos, usamos, 
                divulgamos e protegemos suas informações pessoais quando você usa nossa plataforma.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <Lock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Segurança</h3>
                  <p className="text-sm text-gray-600">Seus dados protegidos</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <Eye className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Transparência</h3>
                  <p className="text-sm text-gray-600">Você controla seus dados</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <Database className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">LGPD</h3>
                  <p className="text-sm text-gray-600">Conformidade total</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                1. Informações que Coletamos
              </h2>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                1.1 Informações Fornecidas por Você
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Quando você cria uma conta ou usa nossos serviços, podemos coletar:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Informações de Cadastro:</strong> nome de usuário, endereço de e-mail, senha (criptografada)</li>
                <li><strong>Informações de Perfil:</strong> foto de perfil, preferências de leitura</li>
                <li><strong>Conteúdo do Usuário:</strong> comentários, avaliações, listas de favoritos</li>
                <li><strong>Informações de Comunicação:</strong> quando você nos envia e-mails ou mensagens</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                1.2 Informações Coletadas Automaticamente
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Quando você usa o MN Studio, coletamos automaticamente:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Dados de Uso:</strong> páginas visitadas, capítulos lidos, tempo de leitura</li>
                <li><strong>Informações do Dispositivo:</strong> tipo de dispositivo, sistema operacional, navegador</li>
                <li><strong>Dados de Log:</strong> endereço IP, data e hora de acesso, páginas solicitadas</li>
                <li><strong>Cookies e Tecnologias Similares:</strong> para melhorar sua experiência</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                2. Como Usamos Suas Informações
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Utilizamos as informações coletadas para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Fornecer e Melhorar o Serviço:</strong> manter sua conta, personalizar sua experiência</li>
                <li><strong>Comunicação:</strong> enviar notificações sobre novos capítulos, atualizações importantes</li>
                <li><strong>Segurança:</strong> detectar e prevenir fraudes, abuso e atividades ilegais</li>
                <li><strong>Análise:</strong> entender como os usuários utilizam nossa plataforma</li>
                <li><strong>Conformidade Legal:</strong> cumprir obrigações legais e regulamentares</li>
                <li><strong>Recomendações:</strong> sugerir conteúdo relevante baseado em seus interesses</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                3. Compartilhamento de Informações
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Não vendemos suas informações pessoais. Podemos compartilhar suas informações apenas nas seguintes situações:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Com Seu Consentimento:</strong> quando você autoriza expressamente</li>
                <li><strong>Provedores de Serviço:</strong> empresas que nos ajudam a operar a plataforma (hospedagem, análise)</li>
                <li><strong>Requisitos Legais:</strong> quando exigido por lei ou para proteger direitos</li>
                <li><strong>Transferência de Negócio:</strong> em caso de fusão, aquisição ou venda de ativos</li>
                <li><strong>Informações Públicas:</strong> conteúdo que você escolhe tornar público (comentários, perfil)</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                4. Cookies e Tecnologias de Rastreamento
              </h2>
              <div className="flex items-start gap-3 p-4 bg-amber-50 border-l-4 border-amber-500 rounded mb-4">
                <Cookie className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">O que são Cookies?</h4>
                  <p className="text-sm text-gray-700">
                    Cookies são pequenos arquivos de texto armazenados em seu dispositivo que nos ajudam a melhorar sua experiência.
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                Tipos de Cookies que Usamos:
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Cookies Essenciais:</strong> necessários para o funcionamento básico do site</li>
                <li><strong>Cookies de Preferência:</strong> lembram suas configurações e escolhas</li>
                <li><strong>Cookies de Análise:</strong> nos ajudam a entender como você usa o site</li>
                <li><strong>Cookies de Marketing:</strong> usados para exibir conteúdo relevante</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                Você pode controlar o uso de cookies através das configurações do seu navegador. 
                Note que desabilitar cookies pode afetar a funcionalidade do site.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                5. Segurança dos Dados
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais, incluindo:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Criptografia SSL/TLS para transmissão de dados</li>
                <li>Senhas criptografadas (hashing) usando bcrypt</li>
                <li>Autenticação de dois fatores (quando disponível)</li>
                <li>Monitoramento regular de segurança</li>
                <li>Acesso restrito a dados pessoais</li>
                <li>Backups regulares e seguros</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                Embora façamos o possível para proteger suas informações, nenhum método de transmissão pela Internet 
                é 100% seguro. Você também é responsável por manter sua senha segura.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                6. Seus Direitos (LGPD)
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Acesso:</strong> solicitar uma cópia dos seus dados pessoais</li>
                <li><strong>Correção:</strong> corrigir dados imprecisos ou incompletos</li>
                <li><strong>Exclusão:</strong> solicitar a exclusão de seus dados ("direito ao esquecimento")</li>
                <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado</li>
                <li><strong>Oposição:</strong> opor-se ao processamento de seus dados</li>
                <li><strong>Revogação de Consentimento:</strong> retirar consentimento a qualquer momento</li>
                <li><strong>Informação:</strong> saber quem tem acesso aos seus dados</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                Para exercer qualquer um desses direitos, entre em contato conosco através do e-mail: <strong>privacidade@mnstudio.com</strong>
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                7. Retenção de Dados
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir as finalidades descritas nesta política, 
                a menos que um período de retenção mais longo seja exigido ou permitido por lei.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                <li>Dados de conta: mantidos enquanto sua conta estiver ativa</li>
                <li>Histórico de leitura: mantido por até 2 anos após inatividade</li>
                <li>Logs de acesso: mantidos por até 6 meses</li>
                <li>Comunicações: mantidas conforme necessário para fins legais</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                8. Privacidade de Menores
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nosso serviço não é direcionado a menores de 13 anos. Não coletamos intencionalmente informações pessoais de crianças menores de 13 anos. 
                Se você é pai ou responsável e sabe que seu filho nos forneceu informações pessoais, entre em contato conosco.
              </p>
              <p className="text-gray-700 leading-relaxed mt-3">
                Para usuários entre 13 e 18 anos, recomendamos que os pais ou responsáveis supervisionem o uso da plataforma.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                9. Transferências Internacionais
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Seus dados podem ser transferidos e mantidos em servidores localizados fora do Brasil. 
                Tomamos medidas para garantir que suas informações recebam um nível adequado de proteção, 
                independentemente de onde sejam processadas.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                10. Alterações nesta Política
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações publicando 
                a nova Política de Privacidade nesta página e atualizando a data de "Última atualização". 
                Alterações significativas serão comunicadas por e-mail ou notificação na plataforma.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                11. Contato
              </h2>
              <div className="p-6 bg-primary-50 rounded-lg border-l-4 border-primary-600">
                <div className="flex items-start gap-3">
                  <Mail className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Dúvidas sobre Privacidade?
                    </h4>
                    <p className="text-gray-700 mb-3">
                      Se você tiver perguntas ou preocupações sobre esta Política de Privacidade ou nossas práticas de dados, entre em contato:
                    </p>
                    <ul className="list-none space-y-2 text-gray-700">
                      <li><strong>Email de Privacidade:</strong> privacidade@mnstudio.com</li>
                      <li><strong>Email Geral:</strong> suporte@mnstudio.com</li>
                      <li><strong>Encarregado de Dados (DPO):</strong> dpo@mnstudio.com</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-green-50 border-l-4 border-green-600 rounded">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Seu Compromisso com a Privacidade
                </h4>
                <p className="text-sm text-gray-700">
                  O MN Studio está comprometido em proteger sua privacidade e manter seus dados seguros. 
                  Seguimos as melhores práticas da indústria e estamos em total conformidade com a LGPD (Lei Geral de Proteção de Dados).
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;