const { ReadingHistory, Manga, Novel, MangaChapter, NovelChapter } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

exports.saveReadingProgress = catchAsync(async (req, res, next) => {
  const { content_type, content_id, chapter_id, last_page } = req.body;

  if (!content_type || !content_id || !chapter_id) {
    throw new AppError('content_type, content_id e chapter_id são obrigatórios', 400, 'MISSING_FIELDS');
  }

  const [history, created] = await ReadingHistory.findOrCreate({
    where: {
      user_id: req.userId,
      content_type,
      content_id
    },
    defaults: {
      chapter_id,
      last_page
    }
  });

  if (!created) {
    history.chapter_id = chapter_id;
    history.last_page = last_page;
    await history.save();
  }

  logger.info('Progresso de leitura salvo', {
    userId: req.userId,
    contentType: content_type,
    contentId: content_id,
    chapterId: chapter_id
  });

  res.json({
    message: 'Progresso salvo',
    history
  });
});

exports.getReadingHistory = catchAsync(async (req, res, next) => {
  const { limit = 20 } = req.query;

  const history = await ReadingHistory.findAll({
    where: { user_id: req.userId },
    order: [['updated_at', 'DESC']],
    limit: parseInt(limit)
  });

  // Separar por tipo
  const mangaHistory = history.filter(h => h.content_type === 'manga');
  const novelHistory = history.filter(h => h.content_type === 'novel');

  // Buscar detalhes em paralelo
  const mangaIds = mangaHistory.map(h => h.content_id);
  const novelIds = novelHistory.map(h => h.content_id);

  const [mangas, novels] = await Promise.all([
    mangaIds.length > 0 ? Manga.findAll({
      where: { id: mangaIds },
      include: [{
        model: MangaChapter,
        as: 'chapters',
        attributes: ['id', 'chapter_number', 'title']
      }]
    }) : Promise.resolve([]),
    novelIds.length > 0 ? Novel.findAll({
      where: { id: novelIds },
      include: [{
        model: NovelChapter,
        as: 'chapters',
        attributes: ['id', 'chapter_number', 'title']
      }]
    }) : Promise.resolve([])
  ]);

  // Combinar dados
  const mangaData = mangaHistory.map(h => {
    const manga = mangas.find(m => m.id === h.content_id);
    const chapter = manga?.chapters.find(c => c.id === h.chapter_id);
    return {
      ...h.toJSON(),
      manga,
      current_chapter: chapter
    };
  });

  const novelData = novelHistory.map(h => {
    const novel = novels.find(n => n.id === h.content_id);
    const chapter = novel?.chapters.find(c => c.id === h.chapter_id);
    return {
      ...h.toJSON(),
      novel,
      current_chapter: chapter
    };
  });

  logger.debug('Histórico de leitura recuperado', {
    userId: req.userId,
    mangaCount: mangaData.length,
    novelCount: novelData.length
  });

  res.json({
    history: {
      mangas: mangaData,
      novels: novelData
    }
  });
});

exports.clearHistory = catchAsync(async (req, res, next) => {
  const deletedCount = await ReadingHistory.destroy({
    where: { user_id: req.userId }
  });

  logger.info('Histórico de leitura limpo', {
    userId: req.userId,
    deletedCount
  });

  res.json({
    message: 'Histórico limpo com sucesso',
    deletedCount
  });
});
