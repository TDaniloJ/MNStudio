const { HelpRequest } = require('../models');


module.exports = {
  async getHelpRequests(req, res) {
    try {
      const { unread_only, limit = 10, offset = 0 } = req.query;

      const where = unread_only === 'true'
        ? { is_read: false }
        : {};

      const helpRequests = await HelpRequest.findAll({
        where,
        limit: Number(limit),
        offset: Number(offset),
        order: [['createdAt', 'DESC']]
      });

      const unreadCount = await HelpRequest.count({
        where: { is_read: false }
      });

      res.json({
        helpRequests,
        unread_count: unreadCount
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar solicitações' });
    }
  },

  async createHelpRequest(req, res) {
    try {
        const helpRequest = await HelpRequest.create({
        user_id: req.user.id,
        title: req.body.title,
        description: req.body.description,
        is_read: false
        });

        // 🔥 SOCKET — AVISA ADMINS EM TEMPO REAL
        req.io.to('admins').emit('help-request:new', {
        id: helpRequest.id,
        title: helpRequest.title,
        description: helpRequest.description,
        user_id: helpRequest.user_id,
        createdAt: helpRequest.createdAt
        });

        res.status(201).json({ helpRequest });
    } catch (error) {
        console.error('Erro ao criar help request:', error);
        res.status(500).json({ error: 'Erro ao criar solicitação de ajuda' });
    }
  },

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const helpRequest = await HelpRequest.findByPk(id);

      if (!helpRequest) {
        return res.status(404).json({ error: 'Solicitação não encontrada' });
      }

      await helpRequest.update({
        is_read: true,
        read_at: new Date()
      });

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao marcar como lida' });
    }
  },

  async markAllAsRead(req, res) {
    try {
      await HelpRequest.update(
        { is_read: true, read_at: new Date() },
        { where: { is_read: false } }
      );

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao marcar todas' });
    }
  },

  async deleteHelpRequest(req, res) {
    try {
      const { id } = req.params;

      const helpRequest = await HelpRequest.findByPk(id);
      if (!helpRequest) {
        return res.status(404).json({ error: 'Solicitação não encontrada' });
      }

      await helpRequest.destroy();
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao deletar' });
    }
  }
};
