const {
  Character,
  World,
  MagicSystem,
  CultivationSystem,
  Item,
  Organization,
  Timeline,
  Novel
} = require('../models');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// ========== CHARACTERS ==========
exports.createCharacter = catchAsync(async (req, res, next) => {
  const { novel_id } = req.params;
  const data = req.body;

  if (!data.name || !novel_id) {
    throw new AppError('name e novel_id são obrigatórios', 400, 'MISSING_FIELDS');
  }

  const novel = await Novel.findByPk(novel_id);
  if (!novel) {
    throw new AppError('Novel não encontrada', 404, 'NOT_FOUND', { resource: 'novel', id: novel_id });
  }

  // Parse JSON fields
  const parseableFields = ['strengths', 'weaknesses', 'abilities', 'relationships'];
  for (const field of parseableFields) {
    if (data[field] && typeof data[field] === 'string') {
      try {
        data[field] = JSON.parse(data[field]);
      } catch (e) {
        throw new AppError(`Campo ${field} inválido (JSON esperado)`, 400, 'INVALID_JSON', { field });
      }
    }
  }

  // Handle image upload
  if (req.file) {
    const filename = `character-${Date.now()}.webp`;
    const filepath = path.join('uploads/characters', filename);

    await fs.mkdir('uploads/characters', { recursive: true });

    await sharp(req.file.path)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 90 })
      .toFile(filepath);

    await fs.unlink(req.file.path);
    data.image_url = `/uploads/characters/${filename}`;
  }

  const character = await Character.create({
    ...data,
    novel_id
  });

  logger.info('Personagem criado', {
    userId: req.userId,
    novelId: novel_id,
    characterId: character.id,
    characterName: data.name
  });

  res.status(201).json({
    message: 'Personagem criado com sucesso',
    character
  });
});

exports.getCharacters = catchAsync(async (req, res, next) => {
  const { novel_id } = req.params;

  const novel = await Novel.findByPk(novel_id);
  if (!novel) {
    throw new AppError('Novel não encontrada', 404, 'NOT_FOUND', { resource: 'novel', id: novel_id });
  }

  const characters = await Character.findAll({
    where: { novel_id },
    order: [['created_at', 'DESC']]
  });

  logger.debug('Personagens recuperados', {
    novelId: novel_id,
    count: characters.length
  });

  res.json({ characters });
});

exports.updateCharacter = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;

  const character = await Character.findByPk(id);
  if (!character) {
    throw new AppError('Personagem não encontrado', 404, 'NOT_FOUND', { resource: 'character', id });
  }

  // Parse JSON fields
  const parseableFields = ['strengths', 'weaknesses', 'abilities', 'relationships'];
  for (const field of parseableFields) {
    if (data[field] && typeof data[field] === 'string') {
      try {
        data[field] = JSON.parse(data[field]);
      } catch (e) {
        throw new AppError(`Campo ${field} inválido (JSON esperado)`, 400, 'INVALID_JSON', { field });
      }
    }
  }

  // Handle image update
  if (req.file) {
    // Delete old image
    if (character.image_url) {
      const oldPath = path.join(__dirname, '../..', character.image_url);
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        logger.warn('Erro ao deletar imagem antiga', { characterId: id });
      }
    }

    const filename = `character-${Date.now()}.webp`;
    const filepath = path.join('uploads/characters', filename);

    await fs.mkdir('uploads/characters', { recursive: true });

    await sharp(req.file.path)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 90 })
      .toFile(filepath);

    await fs.unlink(req.file.path);
    data.image_url = `/uploads/characters/${filename}`;
  }

  await character.update(data);

  logger.info('Personagem atualizado', {
    userId: req.userId,
    characterId: id
  });

  res.json({
    message: 'Personagem atualizado com sucesso',
    character
  });
});

exports.deleteCharacter = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const character = await Character.findByPk(id);
  if (!character) {
    throw new AppError('Personagem não encontrado', 404, 'NOT_FOUND', { resource: 'character', id });
  }

  // Delete image
  if (character.image_url) {
    const imagePath = path.join(__dirname, '../..', character.image_url);
    try {
      await fs.unlink(imagePath);
    } catch (err) {
      logger.warn('Erro ao deletar imagem', { characterId: id });
    }
  }

  await character.destroy();

  logger.info('Personagem deletado', {
    userId: req.userId,
    characterId: id
  });

  res.json({ message: 'Personagem deletado com sucesso' });
});

// ========== WORLDS ==========
exports.createWorld = catchAsync(async (req, res, next) => {
  const { novel_id } = req.params;
  const data = req.body;

  if (!data.name || !novel_id) {
    throw new AppError('name e novel_id são obrigatórios', 400, 'MISSING_FIELDS');
  }

  const novel = await Novel.findByPk(novel_id);
  if (!novel) {
    throw new AppError('Novel não encontrada', 404, 'NOT_FOUND', { resource: 'novel', id: novel_id });
  }

  // Parse JSON/Array fields
  const parseableFields = ['races', 'languages', 'locations', 'resources', 'dangers'];
  for (const field of parseableFields) {
    if (data[field] && typeof data[field] === 'string') {
      try {
        data[field] = JSON.parse(data[field]);
      } catch (e) {
        throw new AppError(`Campo ${field} inválido (JSON esperado)`, 400, 'INVALID_JSON', { field });
      }
    }
  }

  // Handle image upload
  if (req.file) {
    const filename = `world-${Date.now()}.webp`;
    const filepath = path.join('uploads/worlds', filename);

    await fs.mkdir('uploads/worlds', { recursive: true });

    await sharp(req.file.path)
      .resize(800, 600, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(filepath);

    await fs.unlink(req.file.path);
    data.image_url = `/uploads/worlds/${filename}`;
  }

  const world = await World.create({
    ...data,
    novel_id
  });

  logger.info('Mundo criado', {
    userId: req.userId,
    novelId: novel_id,
    worldId: world.id,
    worldName: data.name
  });

  res.status(201).json({
    message: 'Mundo criado com sucesso',
    world
  });
});

exports.getWorlds = catchAsync(async (req, res, next) => {
  const { novel_id } = req.params;

  const novel = await Novel.findByPk(novel_id);
  if (!novel) {
    throw new AppError('Novel não encontrada', 404, 'NOT_FOUND', { resource: 'novel', id: novel_id });
  }

  const worlds = await World.findAll({
    where: { novel_id },
    order: [['created_at', 'DESC']]
  });

  logger.debug('Mundos recuperados', {
    novelId: novel_id,
    count: worlds.length
  });

  res.json({ worlds });
});

exports.updateWorld = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;

  const world = await World.findByPk(id);
  if (!world) {
    throw new AppError('Mundo não encontrado', 404, 'NOT_FOUND', { resource: 'world', id });
  }

  // Parse JSON fields
  const parseableFields = ['races', 'languages', 'locations', 'resources', 'dangers'];
  for (const field of parseableFields) {
    if (data[field] && typeof data[field] === 'string') {
      try {
        data[field] = JSON.parse(data[field]);
      } catch (e) {
        throw new AppError(`Campo ${field} inválido (JSON esperado)`, 400, 'INVALID_JSON', { field });
      }
    }
  }

  // Handle image update
  if (req.file) {
    if (world.image_url) {
      const oldPath = path.join(__dirname, '../..', world.image_url);
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        logger.warn('Erro ao deletar imagem antiga', { worldId: id });
      }
    }

    const filename = `world-${Date.now()}.webp`;
    const filepath = path.join('uploads/worlds', filename);

    await fs.mkdir('uploads/worlds', { recursive: true });

    await sharp(req.file.path)
      .resize(800, 600, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(filepath);

    await fs.unlink(req.file.path);
    data.image_url = `/uploads/worlds/${filename}`;
  }

  await world.update(data);

  logger.info('Mundo atualizado', {
    userId: req.userId,
    worldId: id
  });

  res.json({
    message: 'Mundo atualizado com sucesso',
    world
  });
});

exports.deleteWorld = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const world = await World.findByPk(id);
  if (!world) {
    throw new AppError('Mundo não encontrado', 404, 'NOT_FOUND', { resource: 'world', id });
  }

  // Delete image
  if (world.image_url) {
    const imagePath = path.join(__dirname, '../..', world.image_url);
    try {
      await fs.unlink(imagePath);
    } catch (err) {
      logger.warn('Erro ao deletar imagem', { worldId: id });
    }
  }

  await world.destroy();

  logger.info('Mundo deletado', {
    userId: req.userId,
    worldId: id
  });

  res.json({ message: 'Mundo deletado com sucesso' });
});

// ========== MAGIC SYSTEMS ==========
exports.createMagicSystem = catchAsync(async (req, res, next) => {
  const { novel_id } = req.params;
  const { name, description, rules, types } = req.body;

  if (!name || !novel_id) {
    throw new AppError('name e novel_id são obrigatórios', 400, 'MISSING_FIELDS');
  }

  const magicSystem = await MagicSystem.create({
    novel_id,
    name,
    description,
    rules: rules ? JSON.parse(rules) : null,
    types: types ? JSON.parse(types) : null
  });

  logger.info('Sistema de magia criado', {
    userId: req.userId,
    novelId: novel_id,
    systemId: magicSystem.id
  });

  res.status(201).json({
    message: 'Sistema de magia criado com sucesso',
    magicSystem
  });
});

exports.getMagicSystems = catchAsync(async (req, res, next) => {
  const { novel_id } = req.params;

  const magicSystems = await MagicSystem.findAll({
    where: { novel_id },
    order: [['created_at', 'DESC']]
  });

  logger.debug('Sistemas de magia recuperados', {
    novelId: novel_id,
    count: magicSystems.length
  });

  res.json({ magicSystems });
});

exports.updateMagicSystem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { description, rules, types } = req.body;

  const magicSystem = await MagicSystem.findByPk(id);
  if (!magicSystem) {
    throw new AppError('Sistema de magia não encontrado', 404, 'NOT_FOUND', { resource: 'magicSystem', id });
  }

  if (description) magicSystem.description = description;
  if (rules) magicSystem.rules = JSON.parse(rules);
  if (types) magicSystem.types = JSON.parse(types);

  await magicSystem.save();

  logger.info('Sistema de magia atualizado', {
    userId: req.userId,
    systemId: id
  });

  res.json({
    message: 'Sistema de magia atualizado com sucesso',
    magicSystem
  });
});

exports.deleteMagicSystem = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const magicSystem = await MagicSystem.findByPk(id);
  if (!magicSystem) {
    throw new AppError('Sistema de magia não encontrado', 404, 'NOT_FOUND', { resource: 'magicSystem', id });
  }

  await magicSystem.destroy();

  logger.info('Sistema de magia deletado', {
    userId: req.userId,
    systemId: id
  });

  res.json({ message: 'Sistema de magia deletado com sucesso' });
});

// ========== CULTIVATION SYSTEMS ==========
exports.getCultivationSystems = catchAsync(async (req, res, next) => {
  const { novel_id } = req.params;

  const systems = await CultivationSystem.findAll({ where: { novel_id }, order: [['created_at', 'DESC']] });

  logger.debug('Sistemas de cultivo recuperados', { novelId: novel_id, count: systems.length });
  res.json({ cultivationSystems: systems });
});

exports.createCultivationSystem = catchAsync(async (req, res, next) => {
  const { novel_id } = req.params;
  const { name, description, mechanics } = req.body;

  if (!name || !novel_id) {
    throw new AppError('name e novel_id são obrigatórios', 400, 'MISSING_FIELDS');
  }

  const system = await CultivationSystem.create({ novel_id, name, description, mechanics: mechanics ? JSON.parse(mechanics) : null });

  logger.info('Sistema de cultivo criado', { userId: req.userId, novelId: novel_id, systemId: system.id });
  res.status(201).json({ message: 'Sistema de cultivo criado com sucesso', system });
});

exports.updateCultivationSystem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, mechanics } = req.body;

  const system = await CultivationSystem.findByPk(id);
  if (!system) throw new AppError('Sistema de cultivo não encontrado', 404, 'NOT_FOUND', { resource: 'cultivationSystem', id });

  if (name) system.name = name;
  if (description) system.description = description;
  if (mechanics) system.mechanics = JSON.parse(mechanics);

  await system.save();

  logger.info('Sistema de cultivo atualizado', { userId: req.userId, systemId: id });
  res.json({ message: 'Sistema de cultivo atualizado com sucesso', system });
});

exports.deleteCultivationSystem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const system = await CultivationSystem.findByPk(id);
  if (!system) throw new AppError('Sistema de cultivo não encontrado', 404, 'NOT_FOUND', { resource: 'cultivationSystem', id });
  await system.destroy();
  logger.info('Sistema de cultivo deletado', { userId: req.userId, systemId: id });
  res.json({ message: 'Sistema de cultivo deletado com sucesso' });
});

// ========== ITEMS ==========
exports.getItems = catchAsync(async (req, res, next) => {
  const { novel_id } = req.params;
  const items = await Item.findAll({ where: { novel_id }, order: [['created_at', 'DESC']] });
  logger.debug('Items recuperados', { novelId: novel_id, count: items.length });
  res.json({ items });
});

exports.createItem = catchAsync(async (req, res, next) => {
  const { novel_id } = req.params;
  const data = req.body;

  if (!data.name || !novel_id) throw new AppError('name e novel_id são obrigatórios', 400, 'MISSING_FIELDS');

  if (req.file) {
    const filename = `item-${Date.now()}.webp`;
    const filepath = path.join('uploads/items', filename);
    await fs.mkdir('uploads/items', { recursive: true });
    await sharp(req.file.path).resize(600, 600, { fit: 'cover' }).webp({ quality: 85 }).toFile(filepath);
    try { await fs.unlink(req.file.path); } catch (e) {}
    data.image_url = `/uploads/items/${filename}`;
  }

  const item = await Item.create({ ...data, novel_id });
  logger.info('Item criado', { userId: req.userId, novelId: novel_id, itemId: item.id });
  res.status(201).json({ message: 'Item criado com sucesso', item });
});

exports.updateItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;

  const item = await Item.findByPk(id);
  if (!item) throw new AppError('Item não encontrado', 404, 'NOT_FOUND', { resource: 'item', id });

  if (req.file) {
    if (item.image_url) {
      const oldPath = path.join(__dirname, '../..', item.image_url);
      try { await fs.unlink(oldPath); } catch (e) { logger.warn('Erro ao deletar imagem antiga de item', { itemId: id }); }
    }
    const filename = `item-${Date.now()}.webp`;
    const filepath = path.join('uploads/items', filename);
    await fs.mkdir('uploads/items', { recursive: true });
    await sharp(req.file.path).resize(600, 600, { fit: 'cover' }).webp({ quality: 85 }).toFile(filepath);
    try { await fs.unlink(req.file.path); } catch (e) {}
    data.image_url = `/uploads/items/${filename}`;
  }

  await item.update(data);
  logger.info('Item atualizado', { userId: req.userId, itemId: id });
  res.json({ message: 'Item atualizado com sucesso', item });
});

exports.deleteItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const item = await Item.findByPk(id);
  if (!item) throw new AppError('Item não encontrado', 404, 'NOT_FOUND', { resource: 'item', id });
  if (item.image_url) {
    const imagePath = path.join(__dirname, '../..', item.image_url);
    try { await fs.unlink(imagePath); } catch (e) { logger.warn('Erro ao deletar imagem de item', { itemId: id }); }
  }
  await item.destroy();
  logger.info('Item deletado', { userId: req.userId, itemId: id });
  res.json({ message: 'Item deletado com sucesso' });
});

// ========== ORGANIZATIONS ==========
exports.getOrganizations = catchAsync(async (req, res, next) => {
  const { novel_id } = req.params;
  const organizations = await Organization.findAll({ where: { novel_id }, order: [['created_at', 'DESC']] });
  logger.debug('Organizações recuperadas', { novelId: novel_id, count: organizations.length });
  res.json({ organizations });
});

exports.createOrganization = catchAsync(async (req, res, next) => {
  const { novel_id } = req.params;
  const data = req.body;
  if (!data.name || !novel_id) throw new AppError('name e novel_id são obrigatórios', 400, 'MISSING_FIELDS');

  if (req.file) {
    const filename = `org-${Date.now()}.webp`;
    const filepath = path.join('uploads/organizations', filename);
    await fs.mkdir('uploads/organizations', { recursive: true });
    await sharp(req.file.path).resize(800, 600, { fit: 'cover' }).webp({ quality: 85 }).toFile(filepath);
    try { await fs.unlink(req.file.path); } catch (e) {}
    data.image_url = `/uploads/organizations/${filename}`;
  }

  const org = await Organization.create({ ...data, novel_id });
  logger.info('Organização criada', { userId: req.userId, novelId: novel_id, orgId: org.id });
  res.status(201).json({ message: 'Organização criada com sucesso', organization: org });
});

exports.updateOrganization = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  const org = await Organization.findByPk(id);
  if (!org) throw new AppError('Organização não encontrada', 404, 'NOT_FOUND', { resource: 'organization', id });

  if (req.file) {
    if (org.image_url) {
      const oldPath = path.join(__dirname, '../..', org.image_url);
      try { await fs.unlink(oldPath); } catch (e) { logger.warn('Erro ao deletar imagem antiga de organização', { orgId: id }); }
    }
    const filename = `org-${Date.now()}.webp`;
    const filepath = path.join('uploads/organizations', filename);
    await fs.mkdir('uploads/organizations', { recursive: true });
    await sharp(req.file.path).resize(800, 600, { fit: 'cover' }).webp({ quality: 85 }).toFile(filepath);
    try { await fs.unlink(req.file.path); } catch (e) {}
    data.image_url = `/uploads/organizations/${filename}`;
  }

  await org.update(data);
  logger.info('Organização atualizada', { userId: req.userId, orgId: id });
  res.json({ message: 'Organização atualizada com sucesso', organization: org });
});

exports.deleteOrganization = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const org = await Organization.findByPk(id);
  if (!org) throw new AppError('Organização não encontrada', 404, 'NOT_FOUND', { resource: 'organization', id });
  if (org.image_url) {
    const imagePath = path.join(__dirname, '../..', org.image_url);
    try { await fs.unlink(imagePath); } catch (e) { logger.warn('Erro ao deletar imagem de organização', { orgId: id }); }
  }
  await org.destroy();
  logger.info('Organização deletada', { userId: req.userId, orgId: id });
  res.json({ message: 'Organização deletada com sucesso' });
});

// ========== TIMELINE ==========
exports.getTimelineEvents = catchAsync(async (req, res, next) => {
  const { novel_id } = req.params;
  const events = await Timeline.findAll({ where: { novel_id }, order: [['date', 'DESC']] });
  logger.debug('Eventos de timeline recuperados', { novelId: novel_id, count: events.length });
  res.json({ events });
});

exports.createTimelineEvent = catchAsync(async (req, res, next) => {
  const { novel_id } = req.params;
  const data = req.body;
  if (!data.title || !novel_id) throw new AppError('title e novel_id são obrigatórios', 400, 'MISSING_FIELDS');
  const event = await Timeline.create({ ...data, novel_id });
  logger.info('Evento de timeline criado', { userId: req.userId, novelId: novel_id, eventId: event.id });
  res.status(201).json({ message: 'Evento criado com sucesso', event });
});

exports.updateTimelineEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  const event = await Timeline.findByPk(id);
  if (!event) throw new AppError('Evento não encontrado', 404, 'NOT_FOUND', { resource: 'timeline', id });
  await event.update(data);
  logger.info('Evento de timeline atualizado', { userId: req.userId, eventId: id });
  res.json({ message: 'Evento atualizado com sucesso', event });
});

exports.deleteTimelineEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const event = await Timeline.findByPk(id);
  if (!event) throw new AppError('Evento não encontrado', 404, 'NOT_FOUND', { resource: 'timeline', id });
  await event.destroy();
  logger.info('Evento de timeline deletado', { userId: req.userId, eventId: id });
  res.json({ message: 'Evento deletado com sucesso' });
});
