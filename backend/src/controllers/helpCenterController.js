const { HelpCenter } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

module.exports = {
  getAllHelpEntries: catchAsync(async (req, res, next) => {
    const helpEntries = await HelpCenter.findAll({
      order: [['createdAt', 'DESC']]
    });

    logger.debug('Entradas de Help Center recuperadas', { count: helpEntries.length });

    res.json({ helpEntries });
  }),

  getHelpEntryById: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const helpEntry = await HelpCenter.findByPk(id);

    if (!helpEntry) {
      throw new AppError('Entrada não encontrada', 404, 'NOT_FOUND', { resource: 'helpEntry', id });
    }

    logger.debug('Entrada de Help Center recuperada', { id });

    res.json({ helpEntry });
  }),

  createHelpEntry: catchAsync(async (req, res, next) => {
    const { question, answer } = req.body;

    if (!question || !answer) {
      throw new AppError('Pergunta e resposta são obrigatórias', 400, 'MISSING_FIELDS');
    }

    const helpEntry = await HelpCenter.create({
      question,
      answer
    });

    logger.info('Entrada de Help Center criada', {
      adminId: req.user.id,
      entryId: helpEntry.id
    });

    res.status(201).json({ helpEntry });
  }),

  updateHelpEntry: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { question, answer } = req.body;

    const helpEntry = await HelpCenter.findByPk(id);
    if (!helpEntry) {
      throw new AppError('Entrada não encontrada', 404, 'NOT_FOUND', { resource: 'helpEntry', id });
    }

    await helpEntry.update({ question, answer });

    logger.info('Entrada de Help Center atualizada', {
      adminId: req.user.id,
      entryId: id
    });

    res.json({ helpEntry });
  }),

  deleteHelpEntry: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const helpEntry = await HelpCenter.findByPk(id);
    if (!helpEntry) {
      throw new AppError('Entrada não encontrada', 404, 'NOT_FOUND', { resource: 'helpEntry', id });
    }

    await helpEntry.destroy();

    logger.info('Entrada de Help Center deletada', {
      adminId: req.user.id,
      entryId: id
    });

    res.json({ message: 'Entrada deletada com sucesso' });
  })
};
