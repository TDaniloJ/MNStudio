const { Notification, User } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class NotificationController {
  getNotifications = catchAsync(async (req, res, next) => {
    const { user } = req;
    const { unread_only = false, limit = 20, offset = 0 } = req.query;

    const where = {
      user_id: user.id,
      ...(unread_only === 'true' && { read_at: null })
    };

    const [notifications, unreadCount] = await Promise.all([
      Notification.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit: Number(limit),
        offset: Number(offset)
      }),
      Notification.count({
        where: { user_id: user.id, read_at: null }
      })
    ]);

    logger.debug('Notificações recuperadas', {
      userId: user.id,
      count: notifications.rows.length,
      unreadCount,
      filter: unread_only === 'true' ? 'unread' : 'all'
    });

    res.json({
      notifications: notifications.rows,
      total: notifications.count,
      unread_count: unreadCount
    });
  });

  markAsRead = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { user } = req;

    const notification = await Notification.findOne({
      where: { id, user_id: user.id }
    });

    if (!notification) {
      throw new AppError('Notificação não encontrada', 404, 'NOT_FOUND', {
        resource: 'notification',
        id
      });
    }

    if (!notification.read_at) {
      notification.read_at = new Date();
      await notification.save();
    }

    logger.debug('Notificação marcada como lida', {
      userId: user.id,
      notificationId: id
    });

    res.json(notification);
  });

  markAllAsRead = catchAsync(async (req, res, next) => {
    const { user } = req;

    const count = await Notification.update(
      { read_at: new Date() },
      { where: { user_id: user.id, read_at: null } }
    );

    logger.info('Todas as notificações marcadas como lidas', {
      userId: user.id,
      count: count[0]
    });

    res.json({
      message: 'Todas as notificações marcadas como lidas',
      markedCount: count[0]
    });
  });

  deleteNotification = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { user } = req;

    const deleted = await Notification.destroy({
      where: { id, user_id: user.id }
    });

    if (!deleted) {
      throw new AppError('Notificação não encontrada', 404, 'NOT_FOUND', {
        resource: 'notification',
        id
      });
    }

    logger.info('Notificação deletada', {
      userId: user.id,
      notificationId: id
    });

    res.json({ message: 'Notificação deletada' });
  });

  createNotification = catchAsync(async (req, res, next) => {
    const { user } = req;
    const { user_id, type, title, message, related_id, related_type, action_url } = req.body;

    if (!title || !message) {
      throw new AppError('Título e mensagem são obrigatórios', 400, 'MISSING_FIELDS');
    }

    if (user.role !== 'admin') {
      throw new AppError('Permissão insuficiente', 403, 'FORBIDDEN');
    }

    const targetUser = await User.findByPk(user_id);
    if (!targetUser) {
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND', {
        resource: 'user',
        id: user_id
      });
    }

    const notification = await Notification.create({
      user_id,
      type: type || 'system',
      title,
      message,
      related_id,
      related_type,
      action_url: action_url || null
    });

    // ✅ REALTIME SOCKET
    if (req.io) {
      req.io.to(`user:${user_id}`).emit('notification:new', notification);
    }

    logger.info('Notificação criada por admin', {
      adminId: user.id,
      userId: user_id,
      type
    });

    res.status(201).json(notification);
  });

  broadcastNotification = catchAsync(async (req, res, next) => {
    const { user } = req;
    if (user.role !== 'admin') {
      throw new AppError('Acesso negado', 403, 'FORBIDDEN');
    }

    const {
      user_ids,
      send_to_all = false,
      type = 'system',
      title,
      message,
      action_url
    } = req.body;

    if (!title || !message) {
      throw new AppError('Título e mensagem são obrigatórios', 400, 'MISSING_FIELDS');
    }

    let users;

    // 🔥 Enviar para todos
    if (send_to_all === true) {
      users = await User.findAll({ attributes: ['id'] });
    } else {
      if (!Array.isArray(user_ids) || user_ids.length === 0) {
        throw new AppError('Lista de usuários inválida', 400, 'INVALID_ARRAY');
      }

      users = await User.findAll({
        where: { id: user_ids },
        attributes: ['id']
      });
    }

    if (users.length === 0) {
      throw new AppError('Nenhum usuário válido encontrado', 400, 'NO_USERS');
    }

    const validIds = users.map(u => u.id);
    const ignoredIds = send_to_all ? [] : user_ids.filter(id => !validIds.includes(id));

    await Notification.bulkCreate(
      users.map(u => ({
        user_id: u.id,
        type,
        title,
        message,
        action_url: action_url || null
      }))
    );

    logger.info('Notificação broadcast enviada por admin', {
      adminId: user.id,
      recipientCount: validIds.length,
      sendToAll: send_to_all,
      ignoredCount: ignoredIds.length
    });

    res.status(201).json({
      message: `Notificação enviada para ${validIds.length} usuário(s)`,
      sent: validIds.length,
      ignored: ignoredIds
    });
  });
}

module.exports = new NotificationController();
