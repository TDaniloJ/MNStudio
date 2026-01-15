const { Notification, User } = require('../models');

class NotificationController {
  // =========================
  // Listar notificações do usuário
  // =========================
  async getNotifications(req, res) {
    try {
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

      res.json({
        notifications: notifications.rows,
        total: notifications.count,
        unread_count: unreadCount
      });
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      res.status(500).json({ error: 'Erro ao buscar notificações' });
    }
  }

  // =========================
  // Marcar notificação como lida
  // =========================
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const { user } = req;

      const notification = await Notification.findOne({
        where: { id, user_id: user.id }
      });

      if (!notification) {
        return res.status(404).json({ error: 'Notificação não encontrada' });
      }

      if (!notification.read_at) {
        notification.read_at = new Date();
        await notification.save();
      }

      res.json(notification);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      res.status(500).json({ error: 'Erro ao marcar notificação como lida' });
    }
  }

  // =========================
  // Marcar todas como lidas
  // =========================
  async markAllAsRead(req, res) {
    try {
      const { user } = req;

      await Notification.update(
        { read_at: new Date() },
        { where: { user_id: user.id, read_at: null } }
      );

      res.json({ message: 'Todas as notificações marcadas como lidas' });
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      res.status(500).json({ error: 'Erro ao marcar notificações como lidas' });
    }
  }

  // =========================
  // Deletar notificação
  // =========================
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const { user } = req;

      const deleted = await Notification.destroy({
        where: { id, user_id: user.id }
      });

      if (!deleted) {
        return res.status(404).json({ error: 'Notificação não encontrada' });
      }

      res.json({ message: 'Notificação deletada' });
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      res.status(500).json({ error: 'Erro ao deletar notificação' });
    }
  }

  // =========================
  // Criar notificação individual (admin ou sistema)
  // =========================
  async createNotification(req, res) {
    try {
      const { user } = req;
      const { user_id, type, title, message, related_id, related_type, action_url } = req.body;

      if (!title || !message) {
        return res.status(400).json({ error: 'Título e mensagem são obrigatórios' });
      }

      if (type !== 'favorite_update' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Permissão insuficiente' });
      }

      const targetUser = await User.findByPk(user_id);
      if (!targetUser) {
        return res.status(400).json({ error: 'Usuário não encontrado' });
      }

      const notification = await Notification.create({
        user_id,
        type,
        title,
        message,
        related_id,
        related_type,
        action_url: action_url || null
      });

      res.status(201).json(notification);
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      res.status(500).json({ error: 'Erro ao criar notificação' });
    }
  }

  // =========================
  // Broadcast de notificações (ADMIN)
  // =========================
  async broadcastNotification(req, res) {
    try {
      const { user } = req;
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
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
        return res.status(400).json({ error: 'Título e mensagem são obrigatórios' });
      }

      let users;

      // 🔥 Enviar para todos
      if (send_to_all === true) {
        users = await User.findAll({ attributes: ['id'] });
      } else {
        if (!Array.isArray(user_ids) || user_ids.length === 0) {
          return res.status(400).json({ error: 'Lista de usuários inválida' });
        }

        users = await User.findAll({
          where: { id: user_ids },
          attributes: ['id']
        });
      }

      if (users.length === 0) {
        return res.status(400).json({ error: 'Nenhum usuário válido encontrado' });
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

      res.status(201).json({
        message: `Notificação enviada para ${validIds.length} usuário(s)`,
        sent: validIds.length,
        ignored: ignoredIds
      });
    } catch (error) {
      console.error('Erro ao enviar notificação em massa:', error);
      res.status(500).json({ error: 'Erro ao enviar notificação' });
    }
  }
}

module.exports = new NotificationController();
