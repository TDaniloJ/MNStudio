const { Activity } = require('../models');

class ActivityController {
  // Listar atividades do usuário
  async getActivities(req, res) {
    try {
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

      res.json({
        activities: activities.rows,
        total: activities.count
      });
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      res.status(500).json({ error: 'Erro ao buscar atividades' });
    }
  }

  // Registrar nova atividade (uso interno)
  async logActivity(user_id, type, description, related_id, related_type, metadata = null) {
    try {
      return await Activity.create({
        user_id,
        type,
        description,
        related_id,
        related_type,
        metadata
      });
    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
    }
  }

  // Deletar atividade (apenas do usuário ou admin)
  async deleteActivity(req, res) {
    try {
      const { id } = req.params;
      const { user } = req;

      const activity = await Activity.findOne({
        where: { id }
      });

      if (!activity) {
        return res.status(404).json({ error: 'Atividade não encontrada' });
      }

      if (activity.user_id !== user.id && user.role !== 'admin') {
        return res.status(403).json({ error: 'Você não tem permissão para deletar esta atividade' });
      }

      await activity.destroy();

      res.json({ message: 'Atividade deletada' });
    } catch (error) {
      console.error('Erro ao deletar atividade:', error);
      res.status(500).json({ error: 'Erro ao deletar atividade' });
    }
  }

  // Limpar histórico de atividades do usuário
  async clearActivities(req, res) {
    try {
      const { user } = req;

      await Activity.destroy({
        where: { user_id: user.id }
      });

      res.json({ message: 'Histórico de atividades limpo' });
    } catch (error) {
      console.error('Erro ao limpar atividades:', error);
      res.status(500).json({ error: 'Erro ao limpar atividades' });
    }
  }

  // Deletar todos os dados do usuário (GDPR compliant)
 async deleteAccount  (req, res) {
  try {
    const { userId } = req;

    // 1. Deletar todas as notificações
    await Notification.destroy({
      where: { user_id: userId }
    });

    // 2. Deletar todas as atividades
    await Activity.destroy({
      where: { user_id: userId }
    });

    // 3. Deletar todas as badges
    await UserBadge.destroy({
      where: { user_id: userId }
    });

    // 4. Deletar usuário (se desejar)
    await User.destroy({
      where: { id: userId }
    });

    res.json({ message: 'Conta deletada com sucesso (GDPR compliant)' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao deletar conta' });
  }
}

}

module.exports = new ActivityController();
