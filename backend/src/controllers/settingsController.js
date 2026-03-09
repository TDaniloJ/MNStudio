const { Settings } = require('../models');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Obter todas as configurações
exports.getAllSettings = catchAsync(async (req, res, next) => {
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

  logger.debug('Configurações recuperadas', { categoryCount: Object.keys(organized).length });

  res.json({ settings: organized });
});

// Obter configurações públicas (ex.: para frontend público)
exports.getPublicSettings = catchAsync(async (req, res, next) => {
  const defaultSettings = getDefaultSettings();
  const keys = defaultSettings.map(s => s.key);

  const instances = await Settings.findAll({ where: { key: keys } });
  const byKey = {};
  instances.forEach(i => { byKey[i.key] = i; });

  const publicSettings = {};
  for (const def of defaultSettings) {
    publicSettings[def.key] = byKey[def.key] ? byKey[def.key].value : def.value;
  }

  logger.debug('Configurações públicas recuperadas');
  res.json({ settings: publicSettings });
});

// Obter configuração específica
exports.getSetting = catchAsync(async (req, res, next) => {
  const { key } = req.params;
  const setting = await Settings.findOne({ where: { key } });

  if (!setting) {
    throw new AppError('Configuração não encontrada', 404, 'NOT_FOUND', { key });
  }

  logger.debug('Configuração recuperada', { key });

  res.json({ setting });
});

// Atualizar configuração
exports.updateSetting = catchAsync(async (req, res, next) => {
  const { key } = req.params;
  const { value } = req.body;

  let setting = await Settings.findOne({ where: { key } });

  if (!setting) {
    throw new AppError('Configuração não encontrada', 404, 'NOT_FOUND', { key });
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
        logger.warn('Erro ao deletar imagem antiga:', { key, error: err.message });
      }
    }

    // Deletar arquivo temporário
    await fs.unlink(req.file.path);

    setting.value = `/uploads/settings/${filename}`;
  } else if (value !== undefined) {
    setting.value = value;
  }

  await setting.save();

  logger.info('Configuração atualizada', {
    adminId: req.user.id,
    key,
    type: setting.type
  });

  res.json({
    message: 'Configuração atualizada com sucesso',
    setting
  });
});

// Atualizar múltiplas configurações
exports.updateMultipleSettings = catchAsync(async (req, res, next) => {
  const { settings } = req.body;

  if (!settings || typeof settings !== 'object') {
    throw new AppError('Objeto settings é obrigatório', 400, 'MISSING_FIELDS');
  }

  const updatedCount = 0;
  for (const [key, value] of Object.entries(settings)) {
    const setting = await Settings.findOne({ where: { key } });
    if (setting) {
      setting.value = value;
      await setting.save();
      updatedCount++;
    }
  }

  logger.info('Múltiplas configurações atualizadas', {
    adminId: req.user.id,
    count: updatedCount
  });

  res.json({
    message: 'Configurações atualizadas com sucesso',
    updatedCount
  });
});

// Criar configuração
exports.createSetting = catchAsync(async (req, res, next) => {
  const { key, value, type, category, description } = req.body;

  if (!key) {
    throw new AppError('key é obrigatório', 400, 'MISSING_FIELDS');
  }

  const existingSetting = await Settings.findOne({ where: { key } });
  if (existingSetting) {
    throw new AppError('Configuração já existe', 409, 'ALREADY_EXISTS', { key });
  }

  const setting = await Settings.create({
    key,
    value,
    type: type || 'text',
    category: category || 'general',
    description
  });

  logger.info('Configuração criada', {
    adminId: req.user.id,
    key,
    category
  });

  res.status(201).json({
    message: 'Configuração criada com sucesso',
    setting
  });
});

// Deletar configuração
exports.deleteSetting = catchAsync(async (req, res, next) => {
  const { key } = req.params;
  const setting = await Settings.findOne({ where: { key } });

  if (!setting) {
    throw new AppError('Configuração não encontrada', 404, 'NOT_FOUND', { key });
  }

  // Se for imagem, deletar arquivo
  if (setting.type === 'image' && setting.value && setting.value.startsWith('/uploads/')) {
    const filepath = path.join(__dirname, '../..', setting.value);
    try {
      await fs.unlink(filepath);
    } catch (err) {
      logger.warn('Erro ao deletar arquivo de imagem:', { key, error: err.message });
    }
  }

  await setting.destroy();

  logger.info('Configuração deletada', {
    adminId: req.user.id,
    key
  });

  res.json({ message: 'Configuração deletada com sucesso' });
});

// Resetar para padrões
exports.resetToDefaults = catchAsync(async (req, res, next) => {
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

  logger.info('Configurações resetadas para padrão', {
    adminId: req.user.id,
    count: defaultSettings.length
  });

  res.json({
    message: 'Configurações resetadas para padrão',
    resetCount: defaultSettings.length
  });
});

// Helper function
function getDefaultSettings() {
  return [
    {
      key: 'site_name',
      value: 'MN Studio',
      type: 'text',
      category: 'general',
      description: 'Nome do site'
    },
    {
      key: 'site_description',
      value: 'Seu destino para mangás e novels',
      type: 'text',
      category: 'general',
      description: 'Descrição do site'
    }
  ];
}
