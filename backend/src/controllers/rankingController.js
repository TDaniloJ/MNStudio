const { Manga, Novel, User, MangaChapter, NovelChapter, sequelize } = require('../models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Ranking de Mangás
exports.getMangaRankings = catchAsync(async (req, res, next) => {
  const { type = 'views', limit = 50, period = 'all' } = req.query;

  // Validar parâmetros
  if (!['views', 'rating', 'chapters', 'recent'].includes(type)) {
    throw new AppError('Tipo de ranking inválido', 400, 'INVALID_RANKING_TYPE', { type });
  }

  // Filtro de período
  let dateFilter = {};
  if (period !== 'all') {
    const now = new Date();
    const periodDays = {
      'day': 1,
      'week': 7,
      'month': 30,
      'year': 365
    };

    const daysAgo = new Date(now.getTime() - ((periodDays[period] || 0) * 24 * 60 * 60 * 1000));
    dateFilter = { created_at: { [Op.gte]: daysAgo } };
  }

  let orderBy;
  switch (type) {
    case 'views':
      orderBy = [['views', 'DESC']];
      break;
    case 'rating':
      orderBy = [['rating', 'DESC']];
      break;
    case 'chapters':
      orderBy = [[sequelize.literal('chapter_count'), 'DESC']];
      break;
    case 'recent':
      orderBy = [['created_at', 'DESC']];
      break;
    default:
      orderBy = [['views', 'DESC']];
  }

  // Fetch basic manga data and compute chapter counts in JS to avoid complex SQL
  const mangasRaw = await Manga.findAll({
    where: dateFilter,
    attributes: ['id', 'title', 'cover_image', 'views', 'rating', 'type', 'created_at'],
    raw: true
  });

  const mangasWithCounts = await Promise.all(mangasRaw.map(async (m) => {
    const chapter_count = await MangaChapter.count({ where: { manga_id: m.id } });
    return { ...m, chapter_count };
  }));

  // Sort in JS according to type
  mangasWithCounts.sort((a, b) => {
    if (type === 'views') return (b.views || 0) - (a.views || 0);
    if (type === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (type === 'chapters') return (b.chapter_count || 0) - (a.chapter_count || 0);
    if (type === 'recent') return new Date(b.created_at) - new Date(a.created_at);
    return 0;
  });

  const mangas = mangasWithCounts.slice(0, parseInt(limit));

  logger.debug('Ranking de mangás recuperado', {
    type,
    period,
    count: mangas.length
  });

  res.json({ mangas });
});

// Ranking de Novels
exports.getNovelRankings = catchAsync(async (req, res, next) => {
  const { type = 'views', limit = 50, period = 'all' } = req.query;

  if (!['views', 'rating', 'chapters', 'recent'].includes(type)) {
    throw new AppError('Tipo de ranking inválido', 400, 'INVALID_RANKING_TYPE', { type });
  }

  let dateFilter = {};
  if (period !== 'all') {
    const now = new Date();
    const periodDays = {
      'day': 1,
      'week': 7,
      'month': 30,
      'year': 365
    };

    const daysAgo = new Date(now.getTime() - ((periodDays[period] || 0) * 24 * 60 * 60 * 1000));
    dateFilter = { created_at: { [Op.gte]: daysAgo } };
  }

  let orderBy;
  switch (type) {
    case 'views':
      orderBy = [['views', 'DESC']];
      break;
    case 'rating':
      orderBy = [['rating', 'DESC']];
      break;
    case 'chapters':
      orderBy = [['id', 'DESC']];
      break;
    case 'recent':
      orderBy = [['created_at', 'DESC']];
      break;
    default:
      orderBy = [['views', 'DESC']];
  }

  const novelsRaw = await Novel.findAll({
    where: dateFilter,
    attributes: ['id', 'title', 'cover_image', 'views', 'rating', 'created_at'],
    raw: true
  });

  const novelsWithCounts = await Promise.all(novelsRaw.map(async (n) => {
    const chapter_count = await NovelChapter.count({ where: { novel_id: n.id } });
    return { ...n, chapter_count };
  }));

  novelsWithCounts.sort((a, b) => {
    if (type === 'views') return (b.views || 0) - (a.views || 0);
    if (type === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (type === 'chapters') return (b.chapter_count || 0) - (a.chapter_count || 0);
    if (type === 'recent') return new Date(b.created_at) - new Date(a.created_at);
    return 0;
  });

  const novels = novelsWithCounts.slice(0, parseInt(limit));

  logger.debug('Ranking de novels recuperado', {
    type,
    period,
    count: novels.length
  });

  res.json({ novels });
});

// Ranking Global (Mangás + Novels)
exports.getGlobalRankings = catchAsync(async (req, res, next) => {
  const { type = 'views', limit = 50 } = req.query;

  if (!['views', 'rating'].includes(type)) {
    throw new AppError('Tipo de ranking inválido', 400, 'INVALID_RANKING_TYPE', { type });
  }

  const [mangas, novels] = await Promise.all([
    Manga.findAll({
      attributes: ['id', 'title', 'cover_image', 'views', 'rating', 'type'],
      order: [[type, 'DESC']],
      limit: Math.ceil(parseInt(limit) / 2)
    }),
    Novel.findAll({
      attributes: ['id', 'title', 'cover_image', 'views', 'rating'],
      order: [[type, 'DESC']],
      limit: Math.ceil(parseInt(limit) / 2)
    })
  ]);

  // Combinar e adicionar tipo
  const mangasWithType = mangas.map(m => ({ ...m.toJSON(), content_type: 'manga' }));
  const novelsWithType = novels.map(n => ({ ...n.toJSON(), content_type: 'novel' }));

  // Combinar e ordenar
  let combined = [...mangasWithType, ...novelsWithType];
  combined.sort((a, b) => b[type] - a[type]);
  combined = combined.slice(0, parseInt(limit));

  logger.debug('Ranking global recuperado', {
    type,
    mangaCount: mangas.length,
    novelCount: novels.length,
    totalCount: combined.length
  });

  res.json({ rankings: combined });
});

// Ranking de Usuários
exports.getUserRankings = catchAsync(async (req, res, next) => {
  const { limit = 50 } = req.query;

  const users = await User.findAll({
    where: {
      role: {
        [Op.in]: ['admin', 'uploader']
      }
    },
    attributes: ['id', 'username', 'email', 'avatar_url', 'role', 'created_at'],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    raw: true
  });

  logger.debug('Ranking de usuários recuperado', { count: users.length });

  res.json({ users });
});

// Estatísticas Gerais
exports.getGlobalStats = catchAsync(async (req, res, next) => {
  const [mangaStats, novelStats, userStats] = await Promise.all([
    Manga.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.col('views')), 'total_views']
      ]
    }),
    Novel.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.col('views')), 'total_views']
      ]
    }),
    User.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ]
    })
  ]);

  // Safe logging if auth middleware not present
  logger.info('Estatísticas globais acessadas', {
    userId: req.user ? req.user.id : null,
    role: req.user ? req.user.role : null
  });

  const totalMangas = parseInt(mangaStats.dataValues.total) || 0;
  const totalNovels = parseInt(novelStats.dataValues.total) || 0;
  const totalMangaViews = parseInt(mangaStats.dataValues.total_views) || 0;
  const totalNovelViews = parseInt(novelStats.dataValues.total_views) || 0;
  const totalUsers = parseInt(userStats.dataValues.total) || 0;

  res.json({
    stats: {
      // snake_case (legacy)
      total_mangas: totalMangas,
      total_novels: totalNovels,
      total_manga_views: totalMangaViews,
      total_novel_views: totalNovelViews,
      total_users: totalUsers,
      total_content: totalMangas + totalNovels,
      total_views: totalMangaViews + totalNovelViews,
      // camelCase (frontend compatibility)
      totalMangas: totalMangas,
      totalNovels: totalNovels,
      totalMangaViews: totalMangaViews,
      totalNovelViews: totalNovelViews,
      totalUsers: totalUsers,
      totalContent: totalMangas + totalNovels,
      totalViews: totalMangaViews + totalNovelViews
    }
  });
});
