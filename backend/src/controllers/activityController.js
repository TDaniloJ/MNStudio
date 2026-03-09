const { Activity, Notification, UserBadge, User, Favorite } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class ActivityController {
  getActivities = catchAsync(async (req, res, next) => {
    const { user } = req;
    const { type, limit = 20, offset = 0 } = req.query;

    let where = { user_id: user.id };
    if (type) {
      where.type = type;
    }

    const activities = await Activity.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    logger.debug('Atividades do usuário recuperadas', {
      userId: user.id,
      count: activities.rows.length,
      filter: type || 'all'
    });

    res.json({
      activities: activities.rows,
      total: activities.count
    });
  });

  logActivity = catchAsync(async (user_id, type, description, related_id, related_type, metadata = null) => {
    const activity = await Activity.create({
      user_id,
      type,
      description,
      related_id,
      related_type,
      metadata
    });

    logger.debug('Atividade registrada', {
      userId: user_id,
      type,
      relatedId: related_id,
      relatedType: related_type
    });

    return activity;
  });

  deleteActivity = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { user } = req;

    const activity = await Activity.findOne({ where: { id } });
    if (!activity) {
      throw new AppError('Atividade não encontrada', 404, 'NOT_FOUND', { resource: 'activity', id });
    }

    if (activity.user_id !== user.id && user.role !== 'admin') {
      throw new AppError('Você não tem permissão para deletar esta atividade', 403, 'FORBIDDEN');
    }

    await activity.destroy();

    logger.info('Atividade deletada', {
      userId: user.id,
      activityId: id,
      type: activity.type
    });

    res.json({ message: 'Atividade deletada' });
  });

  clearActivities = catchAsync(async (req, res, next) => {
    const { user } = req;

    const deletedCount = await Activity.destroy({
      where: { user_id: user.id }
    });

    logger.info('Histórico de atividades limpo', {
      userId: user.id,
      deletedCount
    });

    res.json({ message: 'Histórico de atividades limpo', deletedCount });
  });

  deleteAccount = catchAsync(async (req, res, next) => {
    const { userId } = req;

    const [notificationsDeleted, activitiesDeleted, badgesDeleted, userDeleted] = await Promise.all([
      Notification.destroy({ where: { user_id: userId } }),
      Activity.destroy({ where: { user_id: userId } }),
      UserBadge.destroy({ where: { user_id: userId } }),
      User.destroy({ where: { id: userId } })
    ]);

    logger.warn('Conta de usuário deletada (GDPR)', {
      userId,
      itemsDeleted: {
        notifications: notificationsDeleted,
        activities: activitiesDeleted,
        badges: badgesDeleted
      }
    });

    res.json({
      message: 'Conta deletada com sucesso (GDPR compliant)',
      deletedItems: {
        notifications: notificationsDeleted,
        activities: activitiesDeleted,
        badges: badgesDeleted
      }
    });
  });

  getActivity = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { user } = req;

    const activity = await Activity.findByPk(id);
    if (!activity) {
      throw new AppError('Atividade não encontrada', 404, 'NOT_FOUND', { resource: 'activity', id });
    }

    if (activity.user_id !== user.id && user.role !== 'admin') {
      throw new AppError('Sem permissão para ver esta atividade', 403, 'FORBIDDEN');
    }

    logger.debug('Atividade recuperada', {
      userId: user.id,
      activityId: id
    });

    res.json({ activity });
  });

  updateActivity = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { user } = req;
    const { description, metadata } = req.body;

    const activity = await Activity.findByPk(id);
    if (!activity) {
      throw new AppError('Atividade não encontrada', 404, 'NOT_FOUND', { resource: 'activity', id });
    }

    if (activity.user_id !== user.id && user.role !== 'admin') {
      throw new AppError('Sem permissão para atualizar esta atividade', 403, 'FORBIDDEN');
    }

    if (description) activity.description = description;
    if (metadata) activity.metadata = metadata;

    await activity.save();

    logger.info('Atividade atualizada', {
      userId: user.id,
      activityId: id,
      type: activity.type
    });

    res.json({ activity });
  });

  getActivitiesByUser = catchAsync(async (req, res, next) => {
    const { user } = req;
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    if (Number(userId) !== user.id && user.role !== 'admin') {
      throw new AppError('Sem permissão para ver atividades deste usuário', 403, 'FORBIDDEN');
    }

    const activities = await Activity.findAndCountAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    logger.debug('Atividades de usuário recuperadas', {
      requestingUserId: user.id,
      targetUserId: userId,
      count: activities.rows.length
    });

    res.json({ activities: activities.rows, total: activities.count });
  });

  getRecentActivitiesByUser = catchAsync(async (req, res, next) => {
    const { user } = req;
    const { userId } = req.params;

    if (Number(userId) !== user.id && user.role !== 'admin') {
      throw new AppError('Sem permissão para ver atividades deste usuário', 403, 'FORBIDDEN');
    }

    const activities = await Activity.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 10
    });

    logger.debug('Atividades recentes recuperadas', {
      requestingUserId: user.id,
      targetUserId: userId,
      count: activities.length
    });

    res.json({ activities });
  });

}

module.exports = new ActivityController();
