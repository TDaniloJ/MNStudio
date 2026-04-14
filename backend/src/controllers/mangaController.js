const { Manga, MangaChapter, MangaPage, Genre, User } = require('../models');
const { Op, Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// 🔒 Helpers de validação
const parseJSONSafe = (value, fieldName) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch (err) {
    throw new AppError(`${fieldName} inválido (JSON mal formatado)`, 400, 'INVALID_JSON');
  }
};

const toNumberSafe = (value, fieldName) => {
  const num = Number(value);
  if (isNaN(num)) {
    throw new AppError(`${fieldName} deve ser um número válido`, 400, 'INVALID_NUMBER');
  }
  return num;
};

const deleteFileSafe = async (filePath, context) => {
  try {
    await fs.unlink(filePath);
    logger.debug('Arquivo deletado', { filePath, ...context });
  } catch (err) {
    if (err.code !== 'ENOENT') {
      logger.warn('Erro ao deletar arquivo', { filePath, error: err.message, ...context });
    }
  }
};

// 🚀 CREATE
exports.createManga = catchAsync(async (req, res) => {
  const { title, alternative_titles, description, author, artist, status, type, age_rating, genres } = req.body;

  if (!title || title.trim().length < 2) {
    throw new AppError('Título é obrigatório e deve ter pelo menos 2 caracteres', 400, 'INVALID_TITLE');
  }

  const parsedTitles = parseJSONSafe(alternative_titles, 'alternative_titles') || [];
  const parsedGenres = parseJSONSafe(genres, 'genres') || [];

  const manga = await Manga.create({
    title: title.trim(),
    alternative_titles: parsedTitles,
    description: description || '',
    cover_image: req.file ? `/uploads/manga/${req.file.filename}` : null,
    author: author || '',
    artist: artist || '',
    status,
    type,
    age_rating: age_rating !== undefined ? toNumberSafe(age_rating, 'age_rating') : 0,
    uploaded_by: req.userId
  });

  if (parsedGenres.length) {
    await manga.setGenres(parsedGenres);
  }

  const result = await Manga.findByPk(manga.id, {
    include: [
      { model: Genre, as: 'genres' },
      { model: User, as: 'uploader', attributes: ['id', 'username'] }
    ]
  });

  res.status(201).json({ message: 'Mangá criado com sucesso', manga: result });
});

// ✏️ UPDATE
exports.updateManga = catchAsync(async (req, res) => {
  const { id } = req.params;
  const manga = await Manga.findByPk(id);

  if (!manga) {
    throw new AppError('Mangá não encontrado', 404, 'NOT_FOUND');
  }

  if (req.user.role !== 'admin' && manga.uploaded_by !== req.userId) {
    throw new AppError('Sem permissão para editar este mangá', 403, 'FORBIDDEN');
  }

  const { title, alternative_titles, description, author, artist, status, type, age_rating, genres } = req.body;

  if (title) {
    if (title.trim().length < 2) {
      throw new AppError('Título deve ter pelo menos 2 caracteres', 400);
    }
    manga.title = title.trim();
  }

  if (alternative_titles) {
    manga.alternative_titles = parseJSONSafe(alternative_titles, 'alternative_titles');
  }

  if (description !== undefined) manga.description = description;
  if (author !== undefined) manga.author = author;
  if (artist !== undefined) manga.artist = artist;
  if (status) manga.status = status;
  if (type) manga.type = type;

  if (age_rating !== undefined) {
    manga.age_rating = toNumberSafe(age_rating, 'age_rating');
  }

  // 🖼️ imagem
  if (req.file) {
    if (manga.cover_image) {
      const oldPath = path.join(process.cwd(), manga.cover_image);
      await deleteFileSafe(oldPath, { mangaId: id });
    }
    manga.cover_image = `/uploads/manga/${req.file.filename}`;
  }

  await manga.save();

  if (genres) {
    const parsedGenres = parseJSONSafe(genres, 'genres');
    await manga.setGenres(parsedGenres);
  }

  const updated = await Manga.findByPk(id, {
    include: [
      { model: Genre, as: 'genres' },
      { model: User, as: 'uploader', attributes: ['id', 'username'] }
    ]
  });

  res.json({ message: 'Mangá atualizado com sucesso', manga: updated });
});

// 📚 LIST
exports.getAllMangas = catchAsync(async (req, res) => {
  let { page = 1, limit = 20, search, status, type, genre, sort } = req.query;

  page = Number(page);
  limit = Number(limit);

  if (isNaN(page) || page < 1) throw new AppError('page inválido', 400);
  if (isNaN(limit) || limit < 1 || limit > 100) throw new AppError('limit inválido (1-100)', 400);

  const where = {};

  if (search) {
    where.title = { [Op.iLike]: `%${search}%` };
  }

  if (status) where.status = status;
  if (type) where.type = type;

  const include = [
    { model: Genre, as: 'genres' },
    { model: User, as: 'uploader', attributes: ['id', 'username'] }
  ];

  if (genre) {
    include[0].where = { id: genre };
    include[0].required = true;
  }

  const order =
    sort === 'views'
      ? [['views', 'DESC']]
      : sort === 'rating'
      ? [['rating', 'DESC']]
      : [['created_at', 'DESC']];

  const { count, rows } = await Manga.findAndCountAll({
    where,
    include,
    limit,
    offset: (page - 1) * limit,
    order,
    distinct: true,
    attributes: {
      include: [
        [
          Sequelize.literal(`(
            SELECT COUNT(*) FROM manga_chapters mc WHERE mc.manga_id = "Manga".id
          )`),
          'chaptersCount'
        ]
      ]
    }
  });

  res.json({
    mangas: rows,
    pagination: {
      total: count,
      page,
      pages: Math.ceil(count / limit)
    }
  });
});

// 🔍 GET BY ID
exports.getMangaById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const manga = await Manga.findByPk(id, {
    include: [
      { model: Genre, as: 'genres' },
      { model: User, as: 'uploader', attributes: ['id', 'username'] },
      { 
        model: MangaChapter, 
        as: 'chapters',
        attributes: {
          include: [
            'id',
            'chapter_number',
            'title',
            'views',
            'created_at',

            // ✅ Thumbnail (primeira página)
            [
              Sequelize.literal(`(
                SELECT mp.image_url
                FROM manga_pages mp
                WHERE mp.chapter_id = "chapters".id
                ORDER BY mp.page_number ASC
                LIMIT 1
              )`),
              'thumbnail'
            ],

            // ✅ Quantidade de páginas
            [
              Sequelize.literal(`(
                SELECT COUNT(*)
                FROM manga_pages mp
                WHERE mp.chapter_id = "chapters".id
              )`),
              'pagesCount'
            ]
          ]
        },
        order: [['chapter_number', 'ASC']]
      }
    ]
  });

  if (!manga) {
    throw new AppError('Mangá não encontrado', 404, 'NOT_FOUND');
  }

  await manga.increment('views');

  res.json({ manga });
});

// 🗑️ DELETE
exports.deleteManga = catchAsync(async (req, res) => {
  const { id } = req.params;

  const manga = await Manga.findByPk(id);
  if (!manga) {
    throw new AppError('Mangá não encontrado', 404);
  }

  if (req.user.role !== 'admin' && manga.uploaded_by !== req.userId) {
    throw new AppError('Sem permissão para deletar este mangá', 403);
  }

  if (manga.cover_image) {
    const imagePath = path.join(process.cwd(), manga.cover_image);
    await deleteFileSafe(imagePath, { mangaId: id });
  }

  await manga.destroy();

  res.json({ message: 'Mangá deletado com sucesso' });
});
