const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');
const { User, Notification, Badge, UserBadge, Activity, sequelize, Sequelize } = require('../models');
const { Op } = Sequelize;
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const sanitizeUser = (user) => {
  const u = { ...user.get ? user.get() : user };
  delete u.password_hash;
  return u;
};

/**
 * Validar status de usuário
 */
const validateUserStatus = (status) => {
  const allowed = ['active', 'disabled'];
  if (!allowed.includes(status)) {
    throw new AppError('Status inválido', 400, 'INVALID_STATUS', { allowed });
  }
};

/**
 * Validar role de usuário
 */
const validateUserRole = (role) => {
  const allowed = ['admin', 'uploader', 'reader'];
  if (!allowed.includes(role)) {
    throw new AppError('Papel inválido', 400, 'INVALID_ROLE', { allowed });
  }
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const { search, page = 1, limit = 20, role, status, dateFrom, dateTo } = req.query;
  const where = {};

  if (search) {
    where[Op.or] = [
      { username: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } }
    ];
  }

  if (role) where.role = role;
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.created_at = {};
    if (dateFrom) where.created_at[Op.gte] = new Date(dateFrom);
    if (dateTo) where.created_at[Op.lte] = new Date(dateTo);
  }

  const offset = (Number(page) - 1) * Number(limit);

  const { rows: users, count: total } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password_hash'] },
    order: [['created_at', 'DESC']],
    offset,
    limit: Number(limit)
  });

  const pages = Math.max(1, Math.ceil(total / Number(limit)));

  logger.debug('Usuários listados', {
    userId: req.user.id,
    total,
    page: Number(page),
    filters: { search: !!search, role: !!role, status: !!status }
  });

  res.json({ users, pagination: { total, pages, page: Number(page) } });
});

exports.getUsersStats = catchAsync(async (req, res, next) => {
  const [
    total,
    active,
    inactive,
    byRoleRows,
    newToday,
    newThisWeek
  ] = await Promise.all([
    User.count(),
    User.count({ where: { status: 'active' } }),
    User.count({ where: { status: { [Op.ne]: 'active' } } }),
    User.findAll({
      attributes: ['role', [Sequelize.fn('COUNT', Sequelize.literal('*')), 'count']],
      group: ['role'],
      raw: true,
      subQuery: false
    }),
    (() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return User.count({ where: { created_at: { [Op.gte]: today } } });
    })(),
    (() => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return User.count({ where: { created_at: { [Op.gte]: weekAgo } } });
    })()
  ]);

  const byRole = {};
  byRoleRows.forEach(r => { byRole[r.role] = Number(r.count || 0); });

  const stats = {
    total,
    active,
    inactive,
    admins: Number(byRole.admin || 0),
    uploaders: Number(byRole.uploader || 0),
    readers: Number(byRole.reader || 0),
    newToday,
    newThisWeek,
    byRole
  };

  logger.info('Stats de usuários acessados', {
    userId: req.user.id,
    total,
    active,
    newThisWeek
  });

  res.json({ stats });
});

exports.getUserStats = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const [activities, badges] = await Promise.all([
    Activity.count({ where: { user_id: id } }),
    UserBadge.count({ where: { user_id: id } })
  ]);

  res.json({ activities, badges });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const { username, email, password, role = 'reader' } = req.body;

  if (!username || !email || !password) {
    throw new AppError('username, email e password são obrigatórios', 400, 'MISSING_FIELDS', {
      fields: ['username', 'email', 'password']
    });
  }

  if (password.length < 6) {
    throw new AppError('Senha deve ter no mínimo 6 caracteres', 400, 'INVALID_PASSWORD');
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new AppError('Email já cadastrado', 409, 'DUPLICATE_EMAIL', { email });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password_hash: hash, role });

  logger.info('Usuário criado por admin', {
    adminId: req.user.id,
    userId: user.id,
    email: user.email,
    role: user.role
  });

  res.status(201).json({ user: sanitizeUser(user) });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { username, email, role, status } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND', { resource: 'user', id });
  }

  // Validar role se fornecido
  if (role) validateUserRole(role);

  // Validar status se fornecido
  if (status) validateUserStatus(status);

  // Atualizar campos
  if (username) user.username = username;
  if (email) user.email = email;
  if (role) user.role = role;
  if (status) user.status = status;

  await user.save();

  logger.info('Usuário atualizado por admin', {
    adminId: req.user.id,
    userId: id,
    fields: ['username', 'email', 'role', 'status'].filter(f => req.body[f])
  });

  res.json({ user: sanitizeUser(user) });
});

exports.updateUserStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  validateUserStatus(status);

  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND', { resource: 'user', id });
  }

  user.status = status;
  await user.save();

  logger.info('Status de usuário atualizado', {
    adminId: req.user.id,
    userId: id,
    status
  });

  res.json({ message: 'Status atualizado', user: sanitizeUser(user) });
});

exports.updateUserPassword = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    throw new AppError('Senha deve ter no mínimo 6 caracteres', 400, 'INVALID_PASSWORD');
  }

  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND', { resource: 'user', id });
  }

  user.password_hash = await bcrypt.hash(password, 10);
  await user.save();

  logger.info('Senha de usuário atualizada por admin', {
    adminId: req.user.id,
    userId: id
  });

  res.json({ message: 'Senha atualizada com sucesso' });
});

exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  validateUserRole(role);

  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND', { resource: 'user', id });
  }

  user.role = role;
  await user.save();

  logger.info('Papel de usuário atualizado', {
    adminId: req.user.id,
    userId: id,
    role
  });

  res.json({
    message: 'Papel atualizado com sucesso',
    user: sanitizeUser(user)
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND', { resource: 'user', id });
  }

  await user.destroy();

  logger.info('Usuário deletado por admin', {
    adminId: req.user.id,
    userId: id,
    email: user.email
  });

  res.json({ message: 'Usuário deletado com sucesso' });
});

exports.bulkDeleteUsers = catchAsync(async (req, res, next) => {
  const { user_ids } = req.body;

  if (!Array.isArray(user_ids) || user_ids.length === 0) {
    throw new AppError('user_ids deve ser um array não vazio', 400, 'INVALID_ARRAY');
  }

  // Evitar deletar o próprio admin acidentalmente
  const filtered = user_ids.filter(id => id !== req.user.id);

  if (filtered.length === 0) {
    throw new AppError('Não é possível deletar sua própria conta em bulk', 400, 'CANNOT_DELETE_SELF');
  }

  const deleted = await User.destroy({ where: { id: filtered } });

  logger.info('Bulk delete de usuários executado', {
    adminId: req.user.id,
    count: deleted,
    attemptedCount: user_ids.length
  });

  res.json({ message: `Deletados: ${deleted}`, deletedCount: deleted });
});

exports.bulkUpdateRoles = catchAsync(async (req, res, next) => {
  const { user_ids, role } = req.body;

  if (!Array.isArray(user_ids) || user_ids.length === 0) {
    throw new AppError('user_ids deve ser um array não vazio', 400, 'INVALID_ARRAY');
  }

  if (!role) {
    throw new AppError('role é obrigatório', 400, 'MISSING_ROLE');
  }

  validateUserRole(role);

  const [updated] = await User.update({ role }, { where: { id: user_ids } });

  logger.info('Bulk update de roles executado', {
    adminId: req.user.id,
    updatedCount: updated,
    role,
    targetCount: user_ids.length
  });

  res.json({ message: `Atualizados: ${updated}`, updatedCount: updated });
});

exports.bulkEmailUsers = catchAsync(async (req, res, next) => {
  const { user_ids, subject, body } = req.body;

  if (!Array.isArray(user_ids) || user_ids.length === 0) {
    throw new AppError('user_ids deve ser um array não vazio', 400, 'INVALID_ARRAY');
  }

  if (!subject && !body) {
    throw new AppError('subject e/ou body são obrigatórios', 400, 'MISSING_CONTENT');
  }

  const users = await User.findAll({
    where: { id: user_ids },
    attributes: ['email', 'username']
  });

  const emails = users.map(u => u.email).filter(Boolean);

  if (emails.length === 0) {
    throw new AppError('Nenhum email válido encontrado', 400, 'NO_EMAILS');
  }

  // Se smtp configurado, enviar; caso contrário, logar
  if (emailService && emailService.transporter) {
    await Promise.all(emails.map(email =>
      emailService.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: subject || 'Comunicação do MN Studio',
        html: body || ''
      })
    ));

    logger.info('Emails enviados em bulk', {
      adminId: req.user.id,
      emailCount: emails.length,
      subject
    });

    return res.json({ message: `Emails enviados: ${emails.length}`, sentCount: emails.length });
  }

  logger.warn('SMTP não configurado - emails simulados', {
    adminId: req.user.id,
    emailCount: emails.length
  });

  res.json({
    message: 'SMTP não configurado — emails simulados',
    count: emails.length
  });
});

exports.exportUsers = catchAsync(async (req, res, next) => {
  const users = await User.findAll({
    attributes: ['id', 'username', 'email', 'role', 'status', 'created_at'],
    order: [['created_at', 'DESC']]
  });

  // Gerar CSV simples
  const header = ['id', 'username', 'email', 'role', 'status', 'created_at'];
  const rows = users.map(u => header.map(h => {
    let v = u[h];
    if (v instanceof Date) v = v.toISOString();
    return `"${String(v ?? '').replace(/"/g, '""')}"`;
  }).join(','));

  const csv = [header.join(','), ...rows].join('\n');

  logger.info('Usuários exportados para CSV', {
    adminId: req.user.id,
    exportedCount: users.length
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=users_${new Date().toISOString().split('T')[0]}.csv`);
  res.send(csv);
});

exports.getNotificationStats = catchAsync(async (req, res, next) => {
  const [
    totalNotifications,
    unreadNotifications,
    notificationsByType,
    badgesCreated,
    badgesUnlocked,
    activitiesLogged
  ] = await Promise.all([
    Notification.count(),
    Notification.count({ where: { read_at: null } }),
    Notification.findAll({
      attributes: ['type', [sequelize.fn('COUNT', Sequelize.literal('*')), 'count']],
      group: ['type'],
      raw: true
    }),
    Badge.count(),
    UserBadge.count(),
    Activity.count()
  ]);

  logger.info('Estatísticas de notificações acessadas', {
    userId: req.user.id,
    totalNotifications,
    unreadNotifications,
    badgesCreated
  });

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
});