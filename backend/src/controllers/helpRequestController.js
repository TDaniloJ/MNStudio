const { HelpRequest } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

module.exports = {
  getHelpRequests: catchAsync(async (req, res, next) => {
    const { unread_only, limit = 10, offset = 0 } = req.query;

    const where = unread_only === 'true' ? { is_read: false } : {};

    const [helpRequests, unreadCount] = await Promise.all([
      HelpRequest.findAll({
        where,
        limit: Number(limit),
        offset: Number(offset),
        order: [['createdAt', 'DESC']]
      }),
      HelpRequest.count({ where: { is_read: false } })
    ]);

    logger.debug('Solicitações de ajuda recuperadas', {
      count: helpRequests.length,
      unreadCount,
      filter: unread_only === 'true' ? 'unread' : 'all'
    });

    res.json({
      helpRequests,
      unread_count: unreadCount
    });
  }),

  createHelpRequest: catchAsync(async (req, res, next) => {
    const { title, description } = req.body;

    if (!title || !description) {
      throw new AppError('Título e descrição são obrigatórios', 400, 'MISSING_FIELDS');
    }

    const helpRequest = await HelpRequest.create({
      user_id: req.user.id,
      title,
      description,
      is_read: false
    });

    // 🔥 SOCKET — AVISA ADMINS EM TEMPO REAL
    if (req.io) {
      req.io.to('admins').emit('help-request:new', {
        id: helpRequest.id,
        title: helpRequest.title,
        description: helpRequest.description,
        user_id: helpRequest.user_id,
        createdAt: helpRequest.createdAt
      });
    }

    logger.info('Solicitação de ajuda criada', {
      userId: req.user.id,
      requestId: helpRequest.id,
      title
    });

    res.status(201).json({ helpRequest });
  }),

  markAsRead: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const helpRequest = await HelpRequest.findByPk(id);

    if (!helpRequest) {
      throw new AppError('Solicitação não encontrada', 404, 'NOT_FOUND', { resource: 'helpRequest', id });
    }

    await helpRequest.update({
      is_read: true,
      read_at: new Date()
    });

    logger.info('Solicitação de ajuda marcada como lida', {
      adminId: req.user.id,
      requestId: id
    });

    res.json({ success: true });
  }),

  markAllAsRead: catchAsync(async (req, res, next) => {
    const count = await HelpRequest.update(
      { is_read: true, read_at: new Date() },
      { where: { is_read: false } }
    );

    logger.info('Todas as solicitações marcadas como lidas', {
      adminId: req.user.id,
      count: count[0]
    });

    res.json({ success: true, markedCount: count[0] });
  }),

  deleteHelpRequest: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const helpRequest = await HelpRequest.findByPk(id);
    if (!helpRequest) {
      throw new AppError('Solicitação não encontrada', 404, 'NOT_FOUND', { resource: 'helpRequest', id });
    }

    await helpRequest.destroy();

    logger.info('Solicitação de ajuda deletada', {
      adminId: req.user.id,
      requestId: id
    });

    res.json({ success: true });
  })
};
