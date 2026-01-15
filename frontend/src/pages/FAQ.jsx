import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  HelpCircle,
  BookOpen,
  FileText,
  User,
  Settings,
  Shield
} from 'lucide-react';
import Card from '../components/common/Card';
import SearchBar from '../components/common/SearchBar';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState([]);

  const categories = [
    { id: 'all', label: 'Todas', icon: HelpCircle },
    { id: 'general', label: 'Geral', icon: BookOpen },
    { id: 'manga', label: 'Mangás', icon: BookOpen },
    { id: 'novel', label: 'Novels', icon: FileText },
    { id: 'account', label: 'Conta', icon: User },
    { id: 'upload', label: 'Upload', icon: Settings },
    { id: 'privacy', label: 'Privacidade', icon: Shield }
  ];

  const faqData = [
    {
      category: 'general',
      question: 'O que é o MN Studio?',
      answer: 'O MN Studio é uma plataforma online gratuita para leitura de mangás, manhwas, manhuas e novels (light novels e web novels). Oferecemos uma vasta coleção de conteúdo atualizado diariamente, com interface amigável e recursos como favoritos, histórico de leitura e muito mais.'
    },
    {
      category: 'general',
      question: 'O serviço é gratuito?',
      answer: 'Sim! O MN Studio é 100% gratuito. Você pode ler todos os mangás e novels disponíveis na plataforma sem pagar nada. Não há taxas ocultas ou assinaturas obrigatórias.'
    },
    {
      category: 'general',
      question: 'Preciso criar uma conta para ler?',
      answer: 'Não é obrigatório criar uma conta para ler o conteúdo. No entanto, ao criar uma conta gratuita, você terá acesso a recursos extras como: salvar favoritos, manter histórico de leitura sincronizado em todos os dispositivos, deixar comentários e receber notificações de novos capítulos.'
    },
    {
      category: 'manga',
      question: 'Qual a diferença entre Manga, Manhwa e Manhua?',
      answer: 'Manga são quadrinhos japoneses (lidos da direita para esquerda), Manhwa são quadrinhos coreanos (lidos da esquerda para direita, geralmente coloridos) e Manhua são quadrinhos chineses (também lidos da esquerda para direita). Cada um possui seu estilo artístico e narrativo característico.'
    },
    {
      category: 'manga',
      question: 'Com que frequência os capítulos são atualizados?',
      answer: 'A frequência de atualização varia de acordo com cada série. Algumas séries populares recebem atualizações diárias ou semanais, enquanto outras podem ter cronogramas diferentes. Você pode acompanhar as atualizações na página inicial ou ativando notificações para suas séries favoritas.'
    },
    {
      category: 'manga',
      question: 'Como faço para ler um mangá?',
      answer: 'É simples! Navegue pela biblioteca, escolha o mangá que deseja ler, clique na capa e depois selecione o capítulo. O leitor será aberto automaticamente. Você pode navegar entre as páginas clicando nas setas laterais, usando as teclas do teclado (← →) ou clicando na própria imagem.'
    },
    {
      category: 'manga',
      question: 'Posso baixar mangás para ler offline?',
      answer: 'Atualmente não oferecemos a funcionalidade de download para leitura offline. Recomendamos uma conexão à internet para a melhor experiência de leitura. Estamos estudando adicionar este recurso no futuro.'
    },
    {
      category: 'novel',
      question: 'O que são Light Novels e Web Novels?',
      answer: 'Light Novels são romances japoneses ilustrados, geralmente publicados em formato físico. Web Novels são histórias publicadas originalmente online, podendo ser de diversos países. Ambas são histórias em formato de texto, diferente dos mangás que são quadrinhos.'
    },
    {
      category: 'novel',
      question: 'Como personalizar a experiência de leitura de novels?',
      answer: 'No leitor de novels, você pode personalizar: tamanho da fonte, tipo de fonte (Serif, Sans Serif, Monospace), espaçamento entre linhas, largura do texto e tema (Claro, Escuro ou Sépia). Clique no ícone de configurações no canto superior direito do leitor para acessar essas opções.'
    },
    {
      category: 'novel',
      question: 'Posso salvar meu progresso de leitura?',
      answer: 'Sim! Se você tiver uma conta, seu progresso é salvo automaticamente. Ao retornar, você pode continuar de onde parou. O histórico mostra qual foi o último capítulo que você leu de cada novel.'
    },
    {
      category: 'account',
      question: 'Como criar uma conta?',
      answer: 'Clique em "Cadastrar" no canto superior direito, preencha o formulário com nome de usuário, email e senha. Após o cadastro, você receberá acesso imediato à plataforma. Não é necessário verificação de email.'
    },
    {
      category: 'account',
      question: 'Esqueci minha senha, o que fazer?',
      answer: 'Na página de login, clique em "Esqueceu a senha?". Digite seu email cadastrado e enviaremos instruções para redefinir sua senha. Verifique também a pasta de spam do seu email.'
    },
    {
      category: 'account',
      question: 'Posso mudar meu nome de usuário?',
      answer: 'Sim! Acesse "Perfil" no menu do usuário, clique em "Editar Perfil" e você poderá alterar seu nome de usuário, email e adicionar uma foto de perfil.'
    },
    {
      category: 'account',
      question: 'Como excluir minha conta?',
      answer: 'Entre em contato com nosso suporte através da página de contato solicitando a exclusão da conta. Iremos processar sua solicitação em até 48 horas. Note que esta ação é irreversível e todos os seus dados serão permanentemente removidos.'
    },
    {
      category: 'upload',
      question: 'Posso enviar meus próprios mangás/novels?',
      answer: 'Sim! Usuários com papel de "Uploader" ou "Admin" podem enviar conteúdo. Para se tornar um uploader, entre em contato através da página de contato explicando sua intenção. Analisaremos sua solicitação.'
    },
    {
      category: 'upload',
      question: 'Quais são os requisitos para upload?',
      answer: 'Para mangás: imagens em formato JPG, PNG ou WEBP, com boa qualidade (recomendamos 1200px de largura). Para novels: texto em formato UTF-8, bem formatado. As capas devem ter proporção 2:3 (ex: 800x1200px). Todos os uploads devem respeitar direitos autorais.'
    },
    {
      category: 'upload',
      question: 'Como funciona o sistema de capítulos?',
      answer: 'Após criar um mangá ou novel, você pode adicionar capítulos numerados (1, 2, 3...) ou decimais (1.5, 2.5) para capítulos extras. Para mangás, você faz upload das páginas em ordem. Para novels, você digita ou cola o texto do capítulo.'
    },
    {
      category: 'privacy',
      question: 'Meus dados estão seguros?',
      answer: 'Sim! Levamos a segurança muito a sério. Suas senhas são criptografadas, usamos HTTPS para todas as conexões e não compartilhamos seus dados com terceiros. Veja nossa Política de Privacidade completa para mais detalhes.'
    },
    {
      category: 'privacy',
      question: 'Que informações vocês coletam?',
      answer: 'Coletamos apenas informações essenciais: email, nome de usuário, histórico de leitura (se você estiver logado) e favoritos. Não vendemos ou compartilhamos essas informações. Usamos cookies apenas para manter você logado e melhorar a experiência.'
    },
    {
      category: 'privacy',
      question: 'Vocês têm anúncios?',
      answer: 'Atualmente o MN Studio não exibe anúncios. Nosso objetivo é oferecer a melhor experiência de leitura possível. Caso isso mude no futuro, você será notificado e teremos opções para remover anúncios.'
    }
  ];

  const toggleItem = (index) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFAQ = faqData.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 dark:from-primary-800 dark:to-primary-900">
        <div className="container-custom text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">
            Central de Ajuda
          </h1>
          <p className="text-xl text-primary-100 mb-8 dark:text-primary-200">
            Encontre respostas para suas dúvidas
          </p>
          
          <div className="max-w-2xl mx-auto">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por dúvidas..."
            />
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Categories */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  activeCategory === cat.id
                    ? 'bg-primary-600 text-white dark:bg-primary-700 dark:text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredFAQ.length === 0 ? (
            <Card className="p-12 text-center">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4 dark:text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Tente usar outros termos de busca ou navegue pelas categorias
              </p>
            </Card>
          ) : (
            filteredFAQ.map((item, index) => (
              <Card
                key={index}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition"
                onClick={() => toggleItem(index)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1 dark:text-white">
                      {item.question}
                    </h3>
                    {openItems.includes(index) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 dark:text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 dark:text-gray-600" />
                    )}
                  </div>
                  
                  {openItems.includes(index) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line dark:text-gray-300">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Contact CTA */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 dark:from-blue-900 dark:to-purple-900 dark:border-blue-800">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">
              Não encontrou o que procurava?
            </h2>
            <p className="text-gray-600 mb-6 dark:text-gray-300">
              Nossa equipe de suporte está pronta para ajudar!
            </p>
            <a href="/contact">
              <button className="btn btn-primary">
                Entre em Contato
              </button>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;