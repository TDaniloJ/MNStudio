const { Manga, MangaChapter, MangaPage, Genre, User } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

exports.createManga = catchAsync(async (req, res, next) => {
  const { title, alternative_titles, description, author, artist, status, type, genres } = req.body;

  if (!title) {
    throw new AppError('Título é obrigatório', 400, 'MISSING_TITLE');
  }

  let cover_image = null;
  if (req.file) {
    cover_image = `/uploads/manga/${req.file.filename}`;
  }

  const manga = await Manga.create({
    title,
    alternative_titles: alternative_titles ? JSON.parse(alternative_titles) : [],
    description: description || '',
    cover_image,
    author,
    artist: artist || '',
    status,
    type,
    uploaded_by: req.userId
  });

  if (genres) {
    const genreIds = JSON.parse(genres);
    await manga.setGenres(genreIds);
  }

  const mangaWithGenres = await Manga.findByPk(manga.id, {
    include: [
      { model: Genre, as: 'genres' },
      { model: User, as: 'uploader', attributes: ['id', 'username'] }
    ]
  });

  logger.info('Mangá criado', {
    userId: req.userId,
    mangaId: manga.id,
    title: manga.title,
    hasCover: !!cover_image
  });

  res.status(201).json({
    message: 'Mangá criado com sucesso',
    manga: mangaWithGenres
  });
});

exports.updateManga = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, alternative_titles, description, author, artist, status, type, genres } = req.body;

  const manga = await Manga.findByPk(id);
  if (!manga) {
    throw new AppError('Mangá não encontrado', 404, 'NOT_FOUND', { resource: 'manga', id });
  }

  // Verificar permissões
  if (req.user.role !== 'admin' && manga.uploaded_by !== req.userId) {
    throw new AppError('Sem permissão para editar este mangá', 403, 'FORBIDDEN');
  }

  // Atualizar campos
  if (title) manga.title = title;
  if (alternative_titles) manga.alternative_titles = JSON.parse(alternative_titles);
  if (description) manga.description = description;
  if (author) manga.author = author;
  if (artist) manga.artist = artist;
  if (status) manga.status = status;
  if (type) manga.type = type;

  // Processar imagem
  if (req.file) {
    // Deletar imagem antiga se existir
    if (manga.cover_image) {
      const oldPath = path.join(__dirname, '../..', manga.cover_image);
      try {
        await fs.unlink(oldPath);
        logger.debug('Imagem antiga deletada', { mangaId: id, oldPath });
      } catch (err) {
        logger.warn('Erro ao deletar imagem antiga', { mangaId: id, error: err.message });
      }
    }
    manga.cover_image = `/uploads/manga/${req.file.filename}`;
  }

  await manga.save();

  // Atualizar gêneros
  if (genres) {
    const genreIds = JSON.parse(genres);
    await manga.setGenres(genreIds);
  }

  const updatedManga = await Manga.findByPk(id, {
    include: [
      { model: Genre, as: 'genres' },
      { model: User, as: 'uploader', attributes: ['id', 'username'] }
    ]
  });

  logger.info('Mangá atualizado', {
    userId: req.userId,
    mangaId: id,
    fields: ['title', 'description', 'author', 'artist', req.file ? 'cover' : null].filter(Boolean)
  });

  res.json({
    message: 'Mangá atualizado com sucesso',
    manga: updatedManga
  });
});

exports.getAllMangas = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, search, status, type, genre, sort = 'created_at' } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  
  if (search) {
    where.title = { [Op.iLike]: `%${search}%` };
  }
  if (status) {
    where.status = status;
  }
  if (type) {
    where.type = type;
  }

  const include = [
    { model: Genre, as: 'genres' },
    { model: User, as: 'uploader', attributes: ['id', 'username'] }
  ];

  if (genre) {
    include[0].where = { id: genre };
    include[0].required = true;
  }

  const order = sort === 'views' ? [['views', 'DESC']] : 
                sort === 'rating' ? [['rating', 'DESC']] :
                [['created_at', 'DESC']];

  const { count, rows: mangas } = await Manga.findAndCountAll({
    where,
    include,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order,
    distinct: true
  });

  logger.debug('Mangás listados', {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    filters: { search: !!search, status: !!status, type: !!type, genre: !!genre }
  });

  res.json({
    mangas,
    pagination: {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    }
  });
});

exports.getMangaById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const manga = await Manga.findByPk(id, {
    include: [
      { model: Genre, as: 'genres' },
      { model: User, as: 'uploader', attributes: ['id', 'username'] },
      { 
        model: MangaChapter, 
        as: 'chapters',
        attributes: ['id', 'chapter_number', 'title', 'views', 'created_at'],
        order: [['chapter_number', 'ASC']],
        include: [
          {
            model: MangaPage,
            as: 'pages',
            attributes: ['id', 'page_number', 'image_url'],
            limit: 1,
            order: [['page_number', 'ASC']]
          }
        ]
      }
    ]
  });

  if (!manga) {
    throw new AppError('Mangá não encontrado', 404, 'NOT_FOUND', { resource: 'manga', id });
  }

  await manga.increment('views');

  logger.debug('Mangá visualizado', { mangaId: id, views: manga.views + 1 });

  res.json({ manga });
});

exports.deleteManga = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const manga = await Manga.findByPk(id);
  if (!manga) {
    throw new AppError('Mangá não encontrado', 404, 'NOT_FOUND', { resource: 'manga', id });
  }

  // Verificar permissões
  if (req.user.role !== 'admin' && manga.uploaded_by !== req.userId) {
    throw new AppError('Sem permissão para deletar este mangá', 403, 'FORBIDDEN');
  }

  // Deletar imagem
  if (manga.cover_image) {
    const imagePath = path.join(__dirname, '../..', manga.cover_image);
    try {
      await fs.unlink(imagePath);
      logger.debug('Imagem do mangá deletada', { mangaId: id, imagePath });
    } catch (err) {
      logger.warn('Erro ao deletar imagem do mangá', { mangaId: id, error: err.message });
    }
  }

  await manga.destroy();

  logger.info('Mangá deletado', {
    userId: req.userId,
    mangaId: id,
    title: manga.title
  });

  res.json({ message: 'Mangá deletado com sucesso' });
});