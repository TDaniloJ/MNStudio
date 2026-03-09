const { Rating, Manga, Novel, sequelize } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Submit or update a rating for manga/novel
exports.submitRating = catchAsync(async (req, res, next) => {
  const { content_type, content_id, score } = req.body;
  const userId = req.userId || (req.user && req.user.id);

  if (!['manga', 'novel'].includes(content_type)) {
    throw new AppError('content_type inválido', 400, 'INVALID_TYPE');
  }
  if (!content_id || typeof score !== 'number' || score < 0 || score > 5) {
    throw new AppError('content_id e score (0-5) são obrigatórios', 400, 'MISSING_FIELDS');
  }
  if (!userId) {
    throw new AppError('Usuário não autenticado', 401, 'UNAUTHORIZED');
  }

  // Upsert rating
  const [rating] = await Rating.upsert({
    user_id: userId,
    content_type,
    content_id,
    score
  }, { returning: true });

  // Recalculate average on the content
  const table = content_type === 'manga' ? Manga : Novel;
  const avgRow = await Rating.findOne({
    attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'avgScore']],
    where: { content_type, content_id }
  });

  const avg = parseFloat(avgRow.dataValues.avgScore) || 0;
  await table.update({ rating: avg }, { where: { id: content_id } });

  logger.info('Rating submetido', { userId, content_type, content_id, score, avg });

  res.json({ message: 'Avaliação registrada', score, average: avg });
});

// Get ratings for a content (optional)
exports.getRatingsForContent = catchAsync(async (req, res, next) => {
  const { content_type, content_id } = req.params;
  if (!['manga', 'novel'].includes(content_type)) {
    throw new AppError('content_type inválido', 400, 'INVALID_TYPE');
  }

  const ratings = await Rating.findAll({ where: { content_type, content_id }, raw: true });
  res.json({ ratings });
});
