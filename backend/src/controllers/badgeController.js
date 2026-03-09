const { Badge, UserBadge, User, Notification, Activity } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class BadgeController {
  getAllBadges = catchAsync(async (req, res, next) => {
    const badges = await Badge.findAll({
      order: [['rarity', 'DESC']]
    });

    logger.debug('Badges recuperadas', { count: badges.length });

    res.json({ badges });
  });

  getUserBadges = catchAsync(async (req, res, next) => {
    const { user_id } = req.params;

    const user = await User.findByPk(user_id, {
      include: {
        association: 'badges',
        attributes: ['id', 'name', 'description', 'icon_url', 'rarity'],
        through: { attributes: [] }
      }
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND', { resource: 'user', id: user_id });
    }

    const allBadges = await Badge.findAll();

    const badgesWithStatus = allBadges.map(badge => ({
      ...badge.toJSON(),
      unlocked: user.badges.some(ub => ub.id === badge.id),
      unlockedAt: user.badges.find(ub => ub.id === badge.id)?.UserBadge?.created_at
    }));

    logger.debug('Badges do usuário recuperadas', {
      userId: user_id,
      totalBadges: allBadges.length,
      unlockedCount: user.badges.length
    });

    res.json({
      badges: badgesWithStatus,
      unlockedCount: user.badges.length
    });
  });

  awardBadge = catchAsync(async (req, res, next) => {
    const { user_id, badge_id } = req.body;

    if (!user_id || !badge_id) {
      throw new AppError('user_id e badge_id são obrigatórios', 400, 'MISSING_FIELDS');
    }

    const [userExists, badgeExists] = await Promise.all([
      User.findByPk(user_id),
      Badge.findByPk(badge_id)
    ]);

    if (!userExists) {
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND', { resource: 'user', id: user_id });
    }

    if (!badgeExists) {
      throw new AppError('Badge não encontrada', 404, 'NOT_FOUND', { resource: 'badge', id: badge_id });
    }

    const [userBadge, created] = await UserBadge.findOrCreate({
      where: { user_id, badge_id }
    });

    if (!created) {
      throw new AppError('Usuário já possui esta badge', 409, 'ALREADY_UNLOCKED', {
        user_id,
        badge_id
      });
    }

    logger.info('Badge desbloqueada por admin', {
      adminId: req.user.id,
      userId: user_id,
      badgeId: badge_id,
      badgeName: badgeExists.name
    });

    res.status(201).json({
      message: 'Badge desbloqueada com sucesso',
      userBadge
    });
  });

  createBadge = catchAsync(async (req, res, next) => {
    const { name, description, icon_url, condition_type, condition_value, rarity } = req.body;

    if (!name || !condition_type) {
      throw new AppError('Nome e tipo de condição são obrigatórios', 400, 'MISSING_FIELDS', {
        required: ['name', 'condition_type']
      });
    }

    const badge = await Badge.create({
      name,
      description,
      icon_url,
      condition_type,
      condition_value,
      rarity: rarity || 'common'
    });

    logger.info('Badge criada', {
      adminId: req.user.id,
      badgeId: badge.id,
      badgeName: name,
      conditionType: condition_type
    });

    res.status(201).json(badge);
  });

  removeBadge = catchAsync(async (req, res, next) => {
    const { user_id, badge_id } = req.body;

    if (!user_id || !badge_id) {
      throw new AppError('user_id e badge_id são obrigatórios', 400, 'MISSING_FIELDS');
    }

    const deleted = await UserBadge.destroy({
      where: { user_id, badge_id }
    });

    if (deleted === 0) {
      throw new AppError('Relação badge-usuário não encontrada', 404, 'NOT_FOUND', {
        user_id,
        badge_id
      });
    }

    logger.info('Badge removida de usuário', {
      adminId: req.user.id,
      userId: user_id,
      badgeId: badge_id
    });

    res.json({ message: 'Badge removida com sucesso' });
  });
}

const checkAndUnlockBadges = catchAsync(async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND', { resource: 'user', id: userId });
  }

  const { Favorite } = require('../models');

  // 1. Contar favoritos
  const favoriteCount = await Favorite.count({
    where: { user_id: userId }
  });

  // 2. Verificar e desbloquear badge de "Colecionador"
  if (favoriteCount >= 10) {
    const collectorBadge = await Badge.findOne({
      where: { condition_type: 'favorite_count', condition_value: 10 }
    });

    if (collectorBadge) {
      const [userBadge, created] = await UserBadge.findOrCreate({
        where: { user_id: userId, badge_id: collectorBadge.id }
      });

      if (created) {
        // 📢 Notificar usuário
        await Notification.create({
          user_id: userId,
          type: 'system',
          title: '🏆 Nova Conquista!',
          message: `Você desbloqueou a badge "${collectorBadge.name}"!`,
          related_id: collectorBadge.id,
          related_type: 'badge',
          action_url: '/profile?tab=achievements'
        });

        // 📊 Registrar atividade
        await Activity.create({
          user_id: userId,
          type: 'badge_earned',
          description: `Desbloqueou a badge "${collectorBadge.name}"`,
          related_id: collectorBadge.id,
          related_type: 'badge'
        });

        logger.info('Badge desbloqueada automaticamente', {
          userId,
          badgeId: collectorBadge.id,
          badgeName: collectorBadge.name,
          trigger: 'favorite_count',
          favoriteCount
        });
      }
    }
  }
});

module.exports = new BadgeController();
module.exports.checkAndUnlockBadges = checkAndUnlockBadges;
