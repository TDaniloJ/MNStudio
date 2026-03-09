const {
  User,
  Favorite,
  ReadingHistory
} = require('../models');

const { Sequelize } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

exports.getMyStats = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // Buscar stats em paralelo
  const [
    favoritesCount,
    completedTotal,
    activeTotal,
    mangaCompleted,
    mangaActive,
    novelCompleted,
    novelActive,
    user
  ] = await Promise.all([
    Favorite.count({ where: { user_id: userId } }),
    ReadingHistory.count({ where: { user_id: userId } }),
    ReadingHistory.count({
      where: { user_id: userId },
      distinct: true,
      col: 'content_id'
    }),
    ReadingHistory.count({
      where: { user_id: userId, content_type: 'manga' }
    }),
    ReadingHistory.count({
      where: { user_id: userId, content_type: 'manga' },
      distinct: true,
      col: 'content_id'
    }),
    ReadingHistory.count({
      where: { user_id: userId, content_type: 'novel' }
    }),
    ReadingHistory.count({
      where: { user_id: userId, content_type: 'novel' },
      distinct: true,
      col: 'content_id'
    }),
    User.findByPk(userId, { attributes: ['created_at'] })
  ]);

  logger.debug('User stats retrieved', {
    userId,
    favorites: favoritesCount,
    activeReadings: activeTotal
  });

  res.json({
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
});
