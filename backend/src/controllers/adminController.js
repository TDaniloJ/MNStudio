const { User } = require('../models');

exports.getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']]
    });

    res.json({ users });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'uploader', 'reader'].includes(role)) {
      return res.status(400).json({ error: 'Papel inválido' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'Papel atualizado com sucesso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar papel:', error);
    res.status(500).json({ error: 'Erro ao atualizar papel' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    await user.destroy();

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
};

exports.getNotificationStats = async (req, res) => {
  try {
    const totalNotifications = await Notification.count();
    const unreadNotifications = await Notification.count({
      where: { read_at: null }
    });

    const notificationsByType = await Notification.findAll({
      attributes: ['type', [sequelize.fn('COUNT', '*'), 'count']],
      group: ['type']
    });

    const badgesCreated = await Badge.count();
    const badgesUnlocked = await UserBadge.count();

    const activitiesLogged = await Activity.count();

    res.json({
      notifications: {
        total: totalNotifications,
        unread: unreadNotifications,
        byType: notificationsByType
      },
      badges: {
        total: badgesCreated,
        unlocked: badgesUnlocked
      },
      activities: {
        total: activitiesLogged
      }
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};