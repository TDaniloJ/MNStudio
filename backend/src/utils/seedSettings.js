const { Settings } = require('../models');

const defaultSettings = [
  // Geral
  { key: 'site_name', value: 'MN Studio', type: 'text', category: 'general', description: 'Nome do site' },
  { key: 'site_description', value: 'Leia mangás e novels online gratuitamente', type: 'textarea', category: 'general', description: 'Descrição do site' },
  { key: 'site_keywords', value: 'manga, novel, light novel, ler online', type: 'textarea', category: 'general', description: 'Palavras-chave SEO' },
  { key: 'site_logo', value: '', type: 'image', category: 'general', description: 'Logo do site' },
  { key: 'site_favicon', value: '', type: 'image', category: 'general', description: 'Favicon do site' },
  
  // Aparência
  { key: 'primary_color', value: '#0ea5e9', type: 'color', category: 'appearance', description: 'Cor primária' },
  { key: 'secondary_color', value: '#64748b', type: 'color', category: 'appearance', description: 'Cor secundária' },
  { key: 'dark_mode', value: 'false', type: 'boolean', category: 'appearance', description: 'Modo escuro padrão' },
  { key: 'custom_css', value: '', type: 'textarea', category: 'appearance', description: 'CSS personalizado' },
  
  // Funcionalidades
  { key: 'enable_registration', value: 'true', type: 'boolean', category: 'features', description: 'Permitir novos cadastros' },
  { key: 'enable_comments', value: 'true', type: 'boolean', category: 'features', description: 'Permitir comentários' },
  { key: 'enable_ratings', value: 'true', type: 'boolean', category: 'features', description: 'Permitir avaliações' },
  { key: 'reader_auto_advance', value: 'false', type: 'boolean', category: 'features', description: 'Avançar automaticamente para o próximo capítulo (leitores)'} ,
  { key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'features', description: 'Modo manutenção' },
  
  // SEO
  { key: 'google_analytics', value: '', type: 'text', category: 'seo', description: 'ID do Google Analytics' },
  { key: 'meta_og_image', value: '', type: 'image', category: 'seo', description: 'Imagem Open Graph padrão' },
  
  // Redes Sociais
  { key: 'social_facebook', value: '', type: 'text', category: 'social', description: 'URL do Facebook' },
  { key: 'social_twitter', value: '', type: 'text', category: 'social', description: 'URL do Twitter' },
  { key: 'social_instagram', value: '', type: 'text', category: 'social', description: 'URL do Instagram' },
  { key: 'social_discord', value: '', type: 'text', category: 'social', description: 'URL do Discord' },
  
  // Email
  { key: 'contact_email', value: '', type: 'text', category: 'email', description: 'Email de contato' },
  
  // Footer
  { key: 'footer_text', value: '© 2025 MN Studio. Todos os direitos reservados.', type: 'textarea', category: 'footer', description: 'Texto do rodapé' },
  
  // Avançado
  { key: 'max_upload_size', value: '10', type: 'number', category: 'advanced', description: 'Tamanho máximo de upload (MB)' },
  { key: 'items_per_page', value: '20', type: 'number', category: 'advanced', description: 'Itens por página' }
];

const seedSettings = async () => {
  try {
    for (const setting of defaultSettings) {
      await Settings.findOrCreate({
        where: { key: setting.key },
        defaults: setting
      });
    }
    console.log('✅ Configurações padrão criadas!');
  } catch (error) {
    console.error('❌ Erro ao criar configurações:', error);
  }
};

module.exports = seedSettings;