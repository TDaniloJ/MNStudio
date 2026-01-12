const {
  User,
  Favorite,
  ReadingHistory
} = require('../models');

const { Sequelize } = require('sequelize');

exports.getMyStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Favoritos (total)
    const favoritesCount = await Favorite.count({
      where: { user_id: userId }
    });

    // Capítulos lidos (total)
    const completedTotal = await ReadingHistory.count({
      where: { user_id: userId }
    });

    // Leituras ativas (conteúdos únicos - total)
    const activeTotal = await ReadingHistory.count({
      where: { user_id: userId },
      distinct: true,
      col: 'content_id'
    });

    // === MANGA ===
    const mangaCompleted = await ReadingHistory.count({
      where: {
        user_id: userId,
        content_type: 'manga'
      }
    });

    const mangaActive = await ReadingHistory.count({
      where: {
        user_id: userId,
        content_type: 'manga'
      },
      distinct: true,
      col: 'content_id'
    });

    // === NOVEL ===
    const novelCompleted = await ReadingHistory.count({
      where: {
        user_id: userId,
        content_type: 'novel'
      }
    });

    const novelActive = await ReadingHistory.count({
      where: {
        user_id: userId,
        content_type: 'novel'
      },
      distinct: true,
      col: 'content_id'
    });

    // Data de criação
    const user = await User.findByPk(userId, {
      attributes: ['created_at']
    });

    return res.json({
      total: {
        favorites: favoritesCount,
        completed_chapters: completedTotal,
        active_readings: activeTotal
      },
      manga: {
        completed_chapters: mangaCompleted,
        active_readings: mangaActive
      },
      novel: {
        completed_chapters: novelCompleted,
        active_readings: novelActive
      },
      created_at: user?.created_at
    });

  } catch (error) {
    console.error('Erro ao buscar stats do usuário:', error);
    return res.status(500).json({
      error: 'Erro ao buscar estatísticas do usuário'
    });
  }
};
