const { Novel, NovelChapter, Genre, User } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

exports.createNovel = catchAsync(async (req, res, next) => {
  const { title, alternative_titles, description, author, status, genres } = req.body;

  if (!title) {
    throw new AppError('Título é obrigatório', 400, 'MISSING_TITLE');
  }

  let cover_image = null;
  if (req.file) {
    cover_image = `/uploads/novel/${req.file.filename}`;
  }

  const novel = await Novel.create({
    title,
    alternative_titles: alternative_titles ? JSON.parse(alternative_titles) : [],
    description: description || '',
    cover_image,
    author,
    status,
    uploaded_by: req.userId
  });

  if (genres) {
    const genreIds = JSON.parse(genres);
    await novel.setGenres(genreIds);
  }

  const novelWithGenres = await Novel.findByPk(novel.id, {
    include: [
      { model: Genre, as: 'genres' },
      { model: User, as: 'uploader', attributes: ['id', 'username'] }
    ]
  });

  logger.info('Novel criada', {
    userId: req.userId,
    novelId: novel.id,
    title: novel.title,
    hasCover: !!cover_image
  });

  res.status(201).json({
    message: 'Novel criada com sucesso',
    novel: novelWithGenres
  });
});

exports.getAllNovels = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, search, status, genre, sort = 'created_at' } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  if (search) {
    where.title = { [Op.iLike]: `%${search}%` };
  }
  if (status) {
    where.status = status;
  }

  const include = [
    { model: Genre, as: 'genres' },
    { model: User, as: 'uploader', attributes: ['id', 'username'] }
  ];

  if (genre) {
    include[0].where = { id: genre };
    include[0].required = true;
  }

  const order =
    sort === 'views' ? [['views', 'DESC']] :
    sort === 'rating' ? [['rating', 'DESC']] :
    [['created_at', 'DESC']];

  const { count, rows: novels } = await Novel.findAndCountAll({
    where,
    include,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order,
    distinct: true
  });

  logger.debug('Novels listadas', {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    filters: { search: !!search, status: !!status, genre: !!genre }
  });

  res.json({
    novels,
    pagination: {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    }
  });
});

exports.getNovelById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const novel = await Novel.findByPk(id, {
    include: [
      { model: Genre, as: 'genres' },
      { model: User, as: 'uploader', attributes: ['id', 'username'] },
      {
        model: NovelChapter,
        as: 'chapters',
        attributes: ['id', 'chapter_number', 'title', 'views', 'created_at'],
        order: [['chapter_number', 'ASC']]
      }
    ]
  });

  if (!novel) {
    throw new AppError('Novel não encontrada', 404, 'NOT_FOUND', { resource: 'novel', id });
  }

  await novel.increment('views');

  logger.debug('Novel visualizada', { novelId: id, views: novel.views + 1 });

  res.json({ novel });
});

exports.updateNovel = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, alternative_titles, description, author, status, genres } = req.body;

  const novel = await Novel.findByPk(id);
  if (!novel) {
    throw new AppError('Novel não encontrada', 404, 'NOT_FOUND', { resource: 'novel', id });
  }

  // Verificar permissões
  if (req.user.role !== 'admin' && novel.uploaded_by !== req.userId) {
    throw new AppError('Sem permissão para editar esta novel', 403, 'FORBIDDEN');
  }

  // Atualizar campos
  if (title) novel.title = title;
  if (alternative_titles) novel.alternative_titles = JSON.parse(alternative_titles);
  if (description) novel.description = description;
  if (author) novel.author = author;
  if (status) novel.status = status;

  // Processar imagem
  if (req.file) {
    // Deletar imagem antiga se existir
    if (novel.cover_image) {
      const oldPath = path.join(__dirname, '../../', novel.cover_image);
      try {
        await fs.unlink(oldPath);
        logger.debug('Imagem antiga deletada', { novelId: id, oldPath });
      } catch (err) {
        logger.warn('Erro ao deletar imagem antiga', { novelId: id, error: err.message });
      }
    }
    novel.cover_image = `/uploads/novel/${req.file.filename}`;
  }

  await novel.save();

  // Atualizar gêneros
  if (genres) {
    const genreIds = JSON.parse(genres);
    await novel.setGenres(genreIds);
  }

  const updatedNovel = await Novel.findByPk(id, {
    include: [
      { model: Genre, as: 'genres' },
      { model: User, as: 'uploader', attributes: ['id', 'username'] }
    ]
  });

  logger.info('Novel atualizada', {
    userId: req.userId,
    novelId: id,
    fields: ['title', 'description', 'author', req.file ? 'cover' : null].filter(Boolean)
  });

  res.json({
    message: 'Novel atualizada com sucesso',
    novel: updatedNovel
  });
});

exports.deleteNovel = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const novel = await Novel.findByPk(id);
  if (!novel) {
    throw new AppError('Novel não encontrada', 404, 'NOT_FOUND', { resource: 'novel', id });
  }

  // Verificar permissões
  if (req.user.role !== 'admin' && novel.uploaded_by !== req.userId) {
    throw new AppError('Sem permissão para deletar esta novel', 403, 'FORBIDDEN');
  }

  // Deletar imagem
  if (novel.cover_image) {
    const imagePath = path.join(__dirname, '../../', novel.cover_image);
    try {
      await fs.unlink(imagePath);
      logger.debug('Imagem da novel deletada', { novelId: id, imagePath });
    } catch (err) {
      logger.warn('Erro ao deletar imagem da novel', { novelId: id, error: err.message });
    }
  }

  await novel.destroy();

  logger.info('Novel deletada', {
    userId: req.userId,
    novelId: id,
    title: novel.title
  });

  res.json({ message: 'Novel deletada com sucesso' });
});
