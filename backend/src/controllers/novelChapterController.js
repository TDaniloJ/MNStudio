const { NovelChapter, Novel, Favorite, Notification, User, Activity, ReadingHistory } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

exports.createChapter = catchAsync(async (req, res, next) => {
  const { novel_id } = req.params;
  const { chapter_number, title, content } = req.body;

  if (!chapter_number || !title || !content) {
    throw new AppError('chapter_number, title e content são obrigatórios', 400, 'MISSING_FIELDS');
  }

  const novel = await Novel.findByPk(novel_id);
  if (!novel) {
    throw new AppError('Novel não encontrada', 404, 'NOT_FOUND', { resource: 'novel', id: novel_id });
  }

  const existingChapter = await NovelChapter.findOne({
    where: { novel_id, chapter_number }
  });

  if (existingChapter) {
    throw new AppError('Capítulo já existe', 409, 'ALREADY_EXISTS', { novel_id, chapter_number });
  }

  const chapter = await NovelChapter.create({
    novel_id,
    chapter_number,
    title,
    content,
    uploaded_by: req.userId
  });

  // Notificação para usuários que favoritaram a novel
  const favorites = await Favorite.findAll({
    where: { content_type: 'novel', content_id: novel_id },
    attributes: ['user_id']
  });

  if (favorites.length > 0) {
    const notifications = favorites.map(fav => ({
      user_id: fav.user_id,
      type: 'system',
      title: '📢 Novo capítulo disponível!',
      message: `A novel "${novel.title}" recebeu o capítulo ${chapter_number}.`,
      related_id: novel_id,
      related_type: 'novel',
      action_url: `/novel/${novel_id}`
    }));

    await Notification.bulkCreate(notifications);

    // Notificações em tempo real
    if (req.io) {
      favorites.forEach(fav => {
        req.io.to(`user:${fav.user_id}`).emit('notification:new', {
          title: '📢 Novo capítulo disponível!',
          message: `A novel "${novel.title}" recebeu o capítulo ${chapter_number}.`
        });
      });
    }
  }

  logger.info('Capítulo de novel criado', {
    userId: req.userId,
    novelId: novel_id,
    chapterNumber: chapter_number,
    notificationsCount: favorites.length
  });

  res.status(201).json({
    message: 'Capítulo criado com sucesso',
    chapter
  });
});

exports.getChapter = catchAsync(async (req, res, next) => {
  const { chapter_id } = req.params;

  const chapter = await NovelChapter.findByPk(chapter_id, {
    include: [
      {
        model: Novel,
        as: 'novel',
        attributes: ['id', 'title']
      }
    ]
  });

  if (!chapter) {
    throw new AppError('Capítulo não encontrado', 404, 'NOT_FOUND', { resource: 'chapter', id: chapter_id });
  }

  // Incrementar views assincronamente
  chapter.increment('views').catch(err => logger.error('Erro ao incrementar views', { error: err.message }));

  logger.debug('Capítulo de novel recuperado', {
    chapterId: chapter_id,
    views: chapter.views
  });

  res.json({ chapter });
});

exports.updateChapter = catchAsync(async (req, res, next) => {
  const { chapter_id } = req.params;
  const { chapter_number, title, content } = req.body;

  const chapter = await NovelChapter.findByPk(chapter_id);
  if (!chapter) {
    throw new AppError('Capítulo não encontrado', 404, 'NOT_FOUND', { resource: 'chapter', id: chapter_id });
  }

  if (chapter_number !== undefined) chapter.chapter_number = chapter_number;
  if (title) chapter.title = title;
  if (content) chapter.content = content;

  await chapter.save();

  logger.info('Capítulo de novel atualizado', {
    userId: req.userId,
    chapterId: chapter_id
  });

  res.json({
    message: 'Capítulo atualizado com sucesso',
    chapter
  });
});

exports.deleteChapter = catchAsync(async (req, res, next) => {
  const { chapter_id } = req.params;

  const chapter = await NovelChapter.findByPk(chapter_id);
  if (!chapter) {
    throw new AppError('Capítulo não encontrado', 404, 'NOT_FOUND', { resource: 'chapter', id: chapter_id });
  }

  await chapter.destroy();

  logger.info('Capítulo de novel deletado', {
    userId: req.userId,
    chapterId: chapter_id
  });

  res.json({ message: 'Capítulo deletado com sucesso' });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  const { userId } = req;
  const { chapterId } = req.params;

  const chapter = await NovelChapter.findByPk(chapterId, {
    include: { association: 'novel' }
  });

  if (!chapter) {
    throw new AppError('Capítulo não encontrado', 404, 'NOT_FOUND', { resource: 'chapter', id: chapterId });
  }

  // Registrar leitura
  const readingHistory = await ReadingHistory.create({
    user_id: userId,
    chapter_id: chapterId,
    novel_id: chapter.novel_id,
    completed_at: new Date()
  });

  // 📊 REGISTRAR ATIVIDADE
  await Activity.create({
    user_id: userId,
    type: 'chapter_read',
    description: `Leu o capítulo ${chapter.chapter_number}: "${chapter.title}" de "${chapter.novel.title}"`,
    related_id: chapterId,
    related_type: 'chapter',
    metadata: {
      novelId: chapter.novel_id,
      novelTitle: chapter.novel.title
    }
  });

  logger.info('Capítulo de novel marcado como lido', {
    userId,
    chapterId,
    novelId: chapter.novel_id
  });

  res.json({ message: 'Capítulo marcado como lido', readingHistory });
});
