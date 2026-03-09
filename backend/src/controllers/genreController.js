const { Genre } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

exports.createGenre = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    throw new AppError('Nome é obrigatório', 400, 'MISSING_FIELDS');
  }

  const existingGenre = await Genre.findOne({ where: { name } });
  if (existingGenre) {
    throw new AppError('Gênero já existe', 409, 'ALREADY_EXISTS', { name });
  }

  const genre = await Genre.create({ name });

  logger.info('Gênero criado', {
    adminId: req.user.id,
    genreId: genre.id,
    genreName: name
  });

  res.status(201).json({
    message: 'Gênero criado com sucesso',
    genre
  });
});

exports.getAllGenres = catchAsync(async (req, res, next) => {
  const genres = await Genre.findAll({
    order: [['name', 'ASC']]
  });

  logger.debug('Gêneros recuperados', { count: genres.length });

  res.json({ genres });
});

exports.deleteGenre = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const genre = await Genre.findByPk(id);
  if (!genre) {
    throw new AppError('Gênero não encontrado', 404, 'NOT_FOUND', { resource: 'genre', id });
  }

  await genre.destroy();

  logger.info('Gênero deletado', {
    adminId: req.user.id,
    genreId: id,
    genreName: genre.name
  });

  res.json({ message: 'Gênero deletado com sucesso' });
});
