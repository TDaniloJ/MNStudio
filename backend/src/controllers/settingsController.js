const { Settings } = require('../models');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Obter todas as configurações
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.findAll({
      order: [['category', 'ASC'], ['key', 'ASC']]
    });

    // Organizar por categoria
    const organized = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      acc[setting.category][setting.key] = {
        value: setting.value,
        type: setting.type,
        description: setting.description
      };
      return acc;
    }, {});

    res.json({ settings: organized });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
};

// Obter configuração específica
exports.getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOne({ where: { key } });

    if (!setting) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    res.json({ setting });
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({ error: 'Erro ao buscar configuração' });
  }
};

// Atualizar configuração
exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    let setting = await Settings.findOne({ where: { key } });

    if (!setting) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    // Se for imagem, processar upload
    if (setting.type === 'image' && req.file) {
      const filename = `${key}-${Date.now()}.webp`;
      const filepath = path.join('uploads/settings', filename);

      // Criar diretório se não existir
      await fs.mkdir('uploads/settings', { recursive: true });

      await sharp(req.file.path)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 90 })
        .toFile(filepath);

      // Deletar imagem antiga
      if (setting.value && setting.value.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '../..', setting.value);
        try {
          await fs.unlink(oldPath);
        } catch (err) {
          console.log('Erro ao deletar imagem antiga:', err);
        }
      }

      // Deletar arquivo temporário
      await fs.unlink(req.file.path);

      setting.value = `/uploads/settings/${filename}`;
    } else {
      setting.value = value;
    }

    await setting.save();

    res.json({
      message: 'Configuração atualizada com sucesso',
      setting
    });
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({ error: 'Erro ao atualizar configuração' });
  }
};

// Atualizar múltiplas configurações
exports.updateMultipleSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    for (const [key, value] of Object.entries(settings)) {
      const setting = await Settings.findOne({ where: { key } });
      if (setting) {
        setting.value = value;
        await setting.save();
      }
    }

    res.json({ message: 'Configurações atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
};

// Criar configuração
exports.createSetting = async (req, res) => {
  try {
    const { key, value, type, category, description } = req.body;

    const existingSetting = await Settings.findOne({ where: { key } });
    if (existingSetting) {
      return res.status(400).json({ error: 'Configuração já existe' });
    }

    const setting = await Settings.create({
      key,
      value,
      type: type || 'text',
      category: category || 'general',
      description
    });

    res.status(201).json({
      message: 'Configuração criada com sucesso',
      setting
    });
  } catch (error) {
    console.error('Erro ao criar configuração:', error);
    res.status(500).json({ error: 'Erro ao criar configuração' });
  }
};

// Deletar configuração
exports.deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOne({ where: { key } });

    if (!setting) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    // Se for imagem, deletar arquivo
    if (setting.type === 'image' && setting.value && setting.value.startsWith('/uploads/')) {
      const filepath = path.join(__dirname, '../..', setting.value);
      try {
        await fs.unlink(filepath);
      } catch (err) {
        console.log('Erro ao deletar imagem:', err);
      }
    }

    await setting.destroy();

    res.json({ message: 'Configuração deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar configuração:', error);
    res.status(500).json({ error: 'Erro ao deletar configuração' });
  }
};

// Resetar para padrões
exports.resetToDefaults = async (req, res) => {
  try {
    const defaultSettings = getDefaultSettings();

    for (const setting of defaultSettings) {
      const [instance] = await Settings.findOrCreate({
        where: { key: setting.key },
        defaults: setting
      });

      if (instance) {
        await instance.update({ value: setting.value });
      }
    }

    res.json({ message: 'Configurações resetadas para padrão' });
  } catch (error) {
    console.error('Erro ao resetar configurações:', error);
    res.status(500).json({ error: 'Erro ao resetar configurações' });
  }
};

// Obter configurações públicas (para o frontend)
exports.getPublicSettings = async (req, res) => {
  try {
    const settings = await Settings.findAll({
      where: {
        key: [
          'site_name',
          'site_description',
          'site_logo',
          'site_favicon',
          'primary_color',
          'secondary_color',
          'enable_registration',
          'maintenance_mode',
          'footer_text',
          'social_facebook',
          'social_twitter',
          'social_instagram',
          'social_discord'
        ]
      }
    });

    const publicSettings = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    res.json({ settings: publicSettings });
  } catch (error) {
    console.error('Erro ao buscar configurações públicas:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações públicas' });
  }
};

// Configurações padrão
function getDefaultSettings() {
  return [
    // Geral
    { key: 'site_name', value: 'MN Studio', type: 'text', category: 'general', description: 'Nome do site' },
    { key: 'site_description', value: 'Leia mangás e novels online', type: 'textarea', category: 'general', description: 'Descrição do site' },
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
    { key: 'smtp_host', value: '', type: 'text', category: 'email', description: 'Servidor SMTP' },
    { key: 'smtp_port', value: '587', type: 'number', category: 'email', description: 'Porta SMTP' },
    { key: 'smtp_user', value: '', type: 'text', category: 'email', description: 'Usuário SMTP' },
    { key: 'smtp_password', value: '', type: 'text', category: 'email', description: 'Senha SMTP' },
    
    // Footer
    { key: 'footer_text', value: 'Todos os direitos reservados', type: 'textarea', category: 'footer', description: 'Texto do rodapé' },
    { key: 'footer_links', value: '[]', type: 'json', category: 'footer', description: 'Links do rodapé' },
    
    // Avançado
    { key: 'max_upload_size', value: '10', type: 'number', category: 'advanced', description: 'Tamanho máximo de upload (MB)' },
    { key: 'items_per_page', value: '20', type: 'number', category: 'advanced', description: 'Itens por página' },
    { key: 'cache_enabled', value: 'true', type: 'boolean', category: 'advanced', description: 'Habilitar cache' }
  ];
}

module.exports = {
  getAllSettings: exports.getAllSettings,
  getSetting: exports.getSetting,
  updateSetting: exports.updateSetting,
  updateMultipleSettings: exports.updateMultipleSettings,
  createSetting: exports.createSetting,
  deleteSetting: exports.deleteSetting,
  resetToDefaults: exports.resetToDefaults,
  getPublicSettings: exports.getPublicSettings
};