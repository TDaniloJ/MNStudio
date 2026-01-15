const { Manga, Novel, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Ranking de Mangás
exports.getMangaRankings = async (req, res) => {
  try {
    const { type = 'views', limit = 50, period = 'all' } = req.query;

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
        orderBy = [['id', 'DESC']]; // Fallback simples
        break;
      case 'recent':
        orderBy = [['created_at', 'DESC']];
        break;
      default:
        orderBy = [['views', 'DESC']];
    }

    const mangas = await Manga.findAll({
      where: dateFilter,
      attributes: ['id', 'title', 'cover_image', 'views', 'rating', 'type', 'created_at'],
      order: orderBy,
      limit: parseInt(limit),
      raw: true
    });

    res.json({ mangas });
  } catch (error) {
    console.error('Erro ao buscar ranking de mangás:', error);
    res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
};

// Ranking de Novels
exports.getNovelRankings = async (req, res) => {
  try {
    const { type = 'views', limit = 50, period = 'all' } = req.query;

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
        orderBy = [['id', 'DESC']]; // Fallback simples
        break;
      case 'recent':
        orderBy = [['created_at', 'DESC']];
        break;
      default:
        orderBy = [['views', 'DESC']];
    }

    const novels = await Novel.findAll({
      where: dateFilter,
      attributes: ['id', 'title', 'cover_image', 'views', 'rating', 'created_at'],
      order: orderBy,
      limit: parseInt(limit),
      raw: true
    });

    res.json({ novels });
  } catch (error) {
    console.error('Erro ao buscar ranking de novels:', error);
    res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
};

// Ranking Global (Mangás + Novels)
exports.getGlobalRankings = async (req, res) => {
  try {
    const { type = 'views', limit = 50 } = req.query;

    const mangasPromise = Manga.findAll({
      attributes: ['id', 'title', 'cover_image', 'views', 'rating', 'type'],
      order: [[type, 'DESC']],
      limit: Math.ceil(parseInt(limit) / 2)
    });

    const novelsPromise = Novel.findAll({
      attributes: ['id', 'title', 'cover_image', 'views', 'rating'],
      order: [[type, 'DESC']],
      limit: Math.ceil(parseInt(limit) / 2)
    });

    const [mangas, novels] = await Promise.all([mangasPromise, novelsPromise]);

    // Combinar e adicionar tipo
    const mangasWithType = mangas.map(m => ({ ...m.toJSON(), content_type: 'manga' }));
    const novelsWithType = novels.map(n => ({ ...n.toJSON(), content_type: 'novel' }));

    // Combinar e ordenar
    let combined = [...mangasWithType, ...novelsWithType];
    combined.sort((a, b) => b[type] - a[type]);
    combined = combined.slice(0, parseInt(limit));

    res.json({ rankings: combined });
  } catch (error) {
    console.error('Erro ao buscar ranking global:', error);
    res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
};

// Ranking de Usuários
exports.getUserRankings = async (req, res) => {
  try {
    const { type = 'uploads', limit = 50 } = req.query;

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

    res.json({ users });
  } catch (error) {
    console.error('Erro ao buscar ranking de usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
};

// Estatísticas Gerais
exports.getGlobalStats = async (req, res) => {
  try {
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

    res.json({
      stats: {
        total_mangas: parseInt(mangaStats.dataValues.total) || 0,
        total_novels: parseInt(novelStats.dataValues.total) || 0,
        total_manga_views: parseInt(mangaStats.dataValues.total_views) || 0,
        total_novel_views: parseInt(novelStats.dataValues.total_views) || 0,
        total_users: parseInt(userStats.dataValues.total) || 0,
        total_content: (parseInt(mangaStats.dataValues.total) || 0) + (parseInt(novelStats.dataValues.total) || 0),
        total_views: (parseInt(mangaStats.dataValues.total_views) || 0) + (parseInt(novelStats.dataValues.total_views) || 0)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};