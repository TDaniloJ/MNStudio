const { Favorite, Manga, Novel, Activity, Notification } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

exports.addFavorite = catchAsync(async (req, res, next) => {
  const { content_type, content_id } = req.body;

  if (!content_type || !content_id) {
    throw new AppError('content_type e content_id são obrigatórios', 400, 'MISSING_FIELDS');
  }

  if (!['manga', 'novel'].includes(content_type)) {
    throw new AppError('Tipo de conteúdo inválido (manga ou novel)', 400, 'INVALID_CONTENT_TYPE', { content_type });
  }

  let content = null;

  // Verificar se conteúdo existe
  if (content_type === 'manga') {
    content = await Manga.findByPk(content_id);
    if (!content) {
      throw new AppError('Mangá não encontrado', 404, 'NOT_FOUND', { resource: 'manga', id: content_id });
    }
  } else if (content_type === 'novel') {
    content = await Novel.findByPk(content_id);
    if (!content) {
      throw new AppError('Novel não encontrada', 404, 'NOT_FOUND', { resource: 'novel', id: content_id });
    }
  }

  const [favorite, created] = await Favorite.findOrCreate({
    where: {
      user_id: req.userId,
      content_type,
      content_id
    }
  });

  // Se já existia, não cria notificação nem activity
  if (!created) {
    throw new AppError('Já está nos favoritos', 409, 'ALREADY_FAVORITE', { content_type, content_id });
  }

  // Criar notificação no banco
  await Notification.create({
    user_id: req.userId,
    type: 'system',
    title: '❤️ Adicionado aos Favoritos',
    message: `Você adicionou "${content.title}" aos seus favoritos!`,
    related_id: content.id,
    related_type: content_type,
    action_url: content_type === 'manga' ? `/manga/${content.id}` : `/novel/${content.id}`
  });

  // Criar atividade
  await Activity.create({
    user_id: req.userId,
    type: 'favorite_added',
    description: `Adicionou "${content.title}" aos favoritos`,
    related_id: content.id,
    related_type: content_type
  });

  // Notificação em tempo real pro usuário
  if (req.io) {
    req.io.to(`user:${req.userId}`).emit('notification:new', {
      title: '❤️ Favorito adicionado',
      message: `Você adicionou "${content.title}" aos favoritos!`
    });
  }

  logger.info('Favorito adicionado', {
    userId: req.userId,
    contentType: content_type,
    contentId: content_id,
    contentTitle: content.title
  });

  res.status(201).json({
    message: 'Adicionado aos favoritos',
    favorite
  });
});

exports.removeFavorite = catchAsync(async (req, res, next) => {
  const { content_type, content_id } = req.params;

  if (!content_type || !content_id) {
    throw new AppError('content_type e content_id são obrigatórios', 400, 'MISSING_FIELDS');
  }

  const favorite = await Favorite.findOne({
    where: {
      user_id: req.userId,
      content_type,
      content_id
    }
  });

  if (!favorite) {
    throw new AppError('Favorito não encontrado', 404, 'NOT_FOUND', {
      resource: 'favorite',
      user_id: req.userId,
      content_type,
      content_id
    });
  }

  await favorite.destroy();

  logger.info('Favorito removido', {
    userId: req.userId,
    contentType: content_type,
    contentId: content_id
  });

  res.json({ message: 'Removido dos favoritos' });
});

exports.getUserFavorites = catchAsync(async (req, res, next) => {
  const { type } = req.query;
  const where = { user_id: req.userId };

  if (type && ['manga', 'novel'].includes(type)) {
    where.content_type = type;
  }

  const favorites = await Favorite.findAll({ where });

  // Buscar detalhes dos conteúdos
  const mangaIds = favorites.filter(f => f.content_type === 'manga').map(f => f.content_id);
  const novelIds = favorites.filter(f => f.content_type === 'novel').map(f => f.content_id);

  const [mangas, novels] = await Promise.all([
    mangaIds.length > 0 ? Manga.findAll({
      where: { id: mangaIds },
      attributes: ['id', 'title', 'cover_image', 'status', 'rating']
    }) : Promise.resolve([]),
    novelIds.length > 0 ? Novel.findAll({
      where: { id: novelIds },
      attributes: ['id', 'title', 'cover_image', 'status', 'rating']
    }) : Promise.resolve([])
  ]);

  logger.debug('Favoritos do usuário recuperados', {
    userId: req.userId,
    mangaCount: mangas.length,
    novelCount: novels.length
  });

  res.json({
    favorites: {
      mangas,
      novels
    },
    total: favorites.length
  });
});

exports.checkFavorite = catchAsync(async (req, res, next) => {
  const { type, id } = req.params;

  if (!type || !id) {
    throw new AppError('type e id são obrigatórios', 400, 'MISSING_FIELDS');
  }

  const favorite = await Favorite.findOne({
    where: {
      user_id: req.userId,
      content_type: type,
      content_id: id
    }
  });

  logger.debug('Verificação de favorito', {
    userId: req.userId,
    contentType: type,
    contentId: id,
    isFavorite: !!favorite
  });

  res.json({ isFavorite: !!favorite });
});
