const { Badge, UserBadge, User } = require('../models');

class BadgeController {
  // Obter todas as badges
  async getAllBadges(req, res) {
    try {
      const badges = await Badge.findAll({
        order: [['rarity', 'DESC']]
      });

      res.json({ badges });
    } catch (error) {
      console.error('Erro ao buscar badges:', error);
      res.status(500).json({ error: 'Erro ao buscar badges' });
    }
  }

  // Obter badges do usuário com status de desbloqueio
  async getUserBadges(req, res) {
    try {
      const { user_id } = req.params;

      const user = await User.findByPk(user_id, {
        include: {
          association: 'badges',
          attributes: ['id', 'name', 'description', 'icon_url', 'rarity'],
          through: { attributes: [] }
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const allBadges = await Badge.findAll();

      const badgesWithStatus = allBadges.map(badge => ({
        ...badge.toJSON(),
        unlocked: user.badges.some(ub => ub.id === badge.id),
        unlockedAt: user.badges.find(ub => ub.id === badge.id)?.UserBadge?.created_at
      }));

      res.json({
        badges: badgesWithStatus,
        unlockedCount: user.badges.length
      });
    } catch (error) {
      console.error('Erro ao buscar badges do usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar badges do usuário' });
    }
  }

  // Desbloquear badge para um usuário (admin)
  async awardBadge(req, res) {
    try {
      const { user } = req;

      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Você não tem permissão para desbloquear badges' });
      }

      const { user_id, badge_id } = req.body;

      const userExists = await User.findByPk(user_id);
      if (!userExists) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const badgeExists = await Badge.findByPk(badge_id);
      if (!badgeExists) {
        return res.status(404).json({ error: 'Badge não encontrada' });
      }

      const [userBadge, created] = await UserBadge.findOrCreate({
        where: { user_id, badge_id }
      });

      if (!created) {
        return res.status(400).json({ error: 'Usuário já possui esta badge' });
      }

      res.status(201).json({
        message: 'Badge desbloqueada com sucesso',
        userBadge
      });
    } catch (error) {
      console.error('Erro ao desbloquear badge:', error);
      res.status(500).json({ error: 'Erro ao desbloquear badge' });
    }
  }

  // Criar badge (admin)
  async createBadge(req, res) {
    try {
      const { user } = req;

      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Você não tem permissão para criar badges' });
      }

      const { name, description, icon_url, condition_type, condition_value, rarity } = req.body;

      if (!name || !condition_type) {
        return res.status(400).json({ error: 'Nome e tipo de condição são obrigatórios' });
      }

      const badge = await Badge.create({
        name,
        description,
        icon_url,
        condition_type,
        condition_value,
        rarity: rarity || 'common'
      });

      res.status(201).json(badge);
    } catch (error) {
      console.error('Erro ao criar badge:', error);
      res.status(500).json({ error: 'Erro ao criar badge' });
    }
  }

  // Remover badge do usuário
  async removeBadge(req, res) {
    try {
      const { user } = req;

      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Você não tem permissão para remover badges' });
      }

      const { user_id, badge_id } = req.body;

      const deleted = await UserBadge.destroy({
        where: { user_id, badge_id }
      });

      if (deleted === 0) {
        return res.status(404).json({ error: 'Relação badge-usuário não encontrada' });
      }

      res.json({ message: 'Badge removida com sucesso' });
    } catch (error) {
      console.error('Erro ao remover badge:', error);
      res.status(500).json({ error: 'Erro ao remover badge' });
    }
  }
}

module.exports = new BadgeController();
