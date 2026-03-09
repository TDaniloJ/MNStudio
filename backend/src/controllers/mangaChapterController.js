const { MangaChapter, MangaPage, Manga, Favorite, Notification, User } = require('../models');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// ✅ CONFIGURAÇÃO DO SHARP PARA MELHOR PERFORMANCE
sharp.cache(false);
sharp.concurrency(1);

// ✅ FUNÇÃO AUXILIAR PARA LIMPEZA DE ARQUIVOS TEMPORÁRIOS
async function cleanupTempFiles(filePaths) {
  if (!filePaths.length) return;

  logger.debug('Limpando arquivos temporários', { count: filePaths.length });

  for (const filePath of filePaths) {
    try {
      await fs.access(filePath);

      let deleted = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await fs.unlink(filePath);
          deleted = true;
          break;
        } catch (unlinkError) {
          if (unlinkError.code === 'EBUSY') {
            await new Promise(resolve => setTimeout(resolve, 300 * attempt));
          } else if (unlinkError.code === 'ENOENT') {
            deleted = true;
            break;
          }
        }
      }

      if (!deleted) {
        logger.warn('Arquivo não deletado após 3 tentativas', { file: path.basename(filePath) });
      }
    } catch (accessError) {
      // Arquivo não existe - ignorar
    }
  }
}

exports.createChapter = catchAsync(async (req, res, next) => {
  const { manga_id } = req.params;
  const { chapter_number, title } = req.body;

  if (!chapter_number || !title) {
    throw new AppError('chapter_number e title são obrigatórios', 400, 'MISSING_FIELDS');
  }

  const manga = await Manga.findByPk(manga_id);
  if (!manga) {
    throw new AppError('Mangá não encontrado', 404, 'NOT_FOUND', { resource: 'manga', id: manga_id });
  }

  const existingChapter = await MangaChapter.findOne({
    where: { manga_id, chapter_number }
  });

  if (existingChapter) {
    throw new AppError('Capítulo já existe', 409, 'ALREADY_EXISTS', { manga_id, chapter_number });
  }

  const chapter = await MangaChapter.create({
    manga_id,
    chapter_number,
    title,
    uploaded_by: req.userId
  });

  // 🔔 NOTIFICAÇÃO PARA FAVORITOS
  const favorites = await Favorite.findAll({
    where: { content_type: 'manga', content_id: manga_id },
    attributes: ['user_id']
  });

  if (favorites.length > 0) {
    const notifications = favorites.map(fav => ({
      user_id: fav.user_id,
      type: 'system',
      title: '📢 Novo capítulo disponível!',
      message: `O mangá "${manga.title}" recebeu o capítulo ${chapter_number}.`,
      related_id: manga.id,
      related_type: 'manga',
      action_url: `/manga/${manga.id}`
    }));

    await Notification.bulkCreate(notifications);

    // 🔥 REALTIME (Socket.IO)
    if (req.io) {
      favorites.forEach(fav => {
        req.io.to(`user:${fav.user_id}`).emit('notification:new', {
          title: '📢 Novo capítulo disponível!',
          message: `O mangá "${manga.title}" recebeu o capítulo ${chapter_number}.`
        });
      });
    }
  }

  logger.info('Capítulo de mangá criado', {
    userId: req.userId,
    mangaId: manga_id,
    chapterNumber: chapter_number,
    notificationsCount: favorites.length
  });

  res.status(201).json({
    success: true,
    message: 'Capítulo criado com sucesso',
    chapter
  });
});

exports.uploadPages = catchAsync(async (req, res, next) => {
  const tempFiles = req.files?.map(file => file.path) || [];
  const { chapter_id } = req.params;

  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError('Nenhuma imagem fornecida', 400, 'NO_FILES');
    }

    const chapter = await MangaChapter.findByPk(chapter_id);
    if (!chapter) {
      await cleanupTempFiles(tempFiles);
      throw new AppError('Capítulo não encontrado', 404, 'NOT_FOUND', { resource: 'chapter', id: chapter_id });
    }

    const pages = [];
    const failedFiles = [];

    // ✅ PROCESSAMENTO SEQUENCIAL
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      try {
        const filename = `chapter-${chapter_id}-page-${i + 1}-${Date.now()}.webp`;
        const outputPath = path.join('uploads/manga', filename);

        // ✅ PROCESSAR IMAGEM
        await sharp(file.path)
          .resize(1200, null, { withoutEnlargement: true, fit: 'inside' })
          .webp({ quality: 80, effort: 4 })
          .toFile(outputPath);

        // ✅ CRIAR REGISTRO NO BANCO
        const page = await MangaPage.create({
          chapter_id,
          page_number: i + 1,
          image_url: `/uploads/manga/${filename}`
        });

        pages.push(page);

        // ✅ DELETAR TEMPORÁRIO
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          logger.warn('Erro ao deletar arquivo temporário', { file: file.originalname });
        }

        logger.debug('Página de mangá processada', { chapterId: chapter_id, pageNumber: i + 1 });
      } catch (fileError) {
        logger.error('Erro ao processar página', {
          chapterId: chapter_id,
          pageNumber: i + 1,
          file: file.originalname,
          error: fileError.message
        });

        failedFiles.push({
          file: file.originalname,
          error: fileError.message
        });

        // ✅ TENTAR LIMPAR ARQUIVO TEMPORÁRIO
        try {
          await fs.unlink(file.path);
        } catch (e) {
          // Ignorar erro de deleção
        }
      }

      // ✅ DELAY ENTRE PROCESSAMENTOS
      if (i < req.files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }

    logger.info('Upload de páginas de mangá finalizado', {
      userId: req.userId,
      chapterId: chapter_id,
      successCount: pages.length,
      failedCount: failedFiles.length
    });

    const response = {
      success: true,
      message: `${pages.length} páginas adicionadas com sucesso`,
      pages,
      stats: {
        total: req.files.length,
        success: pages.length,
        failed: failedFiles.length
      }
    };

    if (failedFiles.length > 0) {
      response.failedFiles = failedFiles;
    }

    res.status(201).json(response);
  } catch (error) {
    await cleanupTempFiles(tempFiles);
    throw error;
  }
});

exports.getChapterPages = catchAsync(async (req, res, next) => {
  const { chapter_id } = req.params;

  const chapter = await MangaChapter.findByPk(chapter_id, {
    include: [
      {
        model: MangaPage,
        as: 'pages',
        attributes: ['id', 'page_number', 'image_url', 'created_at'],
        order: [['page_number', 'ASC']]
      },
      {
        model: Manga,
        as: 'manga',
        attributes: ['id', 'title', 'cover_image']
      }
    ]
  });

  if (!chapter) {
    throw new AppError('Capítulo não encontrado', 404, 'NOT_FOUND', { resource: 'chapter', id: chapter_id });
  }

  // ✅ INCREMENTAR VISUALIZAÇÕES ASSINCRONAMENTE
  chapter.increment('views').catch(err => logger.error('Erro ao incrementar views', { error: err.message }));

  logger.debug('Páginas de capítulo recuperadas', {
    chapterId: chapter_id,
    pageCount: chapter.pages.length,
    views: chapter.views
  });

  res.json({
    success: true,
    pages: chapter.pages,
    chapter: {
      id: chapter.id,
      chapter_number: chapter.chapter_number,
      title: chapter.title,
      views: chapter.views,
      manga: chapter.manga
    },
    count: chapter.pages.length
  });
});

exports.updateChapter = catchAsync(async (req, res, next) => {
  const { chapter_id } = req.params;
  const { chapter_number, title } = req.body;

  const chapter = await MangaChapter.findByPk(chapter_id);
  if (!chapter) {
    throw new AppError('Capítulo não encontrado', 404, 'NOT_FOUND', { resource: 'chapter', id: chapter_id });
  }

  if (chapter_number) chapter.chapter_number = chapter_number;
  if (title) chapter.title = title;

  await chapter.save();

  logger.info('Capítulo de mangá atualizado', {
    userId: req.userId,
    chapterId: chapter_id
  });

  res.json({
    message: 'Capítulo atualizado com sucesso',
    chapter
  });
});

exports.deleteChapter = catchAsync(async (req, res, next) => {
  const { chapter_id } = req.params;

  const chapter = await MangaChapter.findByPk(chapter_id, {
    include: [{
      model: MangaPage,
      as: 'pages',
      attributes: ['image_url']
    }]
  });

  if (!chapter) {
    throw new AppError('Capítulo não encontrado', 404, 'NOT_FOUND', { resource: 'chapter', id: chapter_id });
  }

  // Deletar imagens do disco
  if (chapter.pages && chapter.pages.length > 0) {
    for (const page of chapter.pages) {
      if (page.image_url) {
        const imagePath = path.join(__dirname, '../..', page.image_url);
        try {
          await fs.unlink(imagePath);
        } catch (err) {
          logger.warn('Erro ao deletar imagem de página', { imageUrl: page.image_url });
        }
      }
    }
  }

  await chapter.destroy();

  logger.info('Capítulo de mangá deletado', {
    userId: req.userId,
    chapterId: chapter_id
  });

  res.json({ message: 'Capítulo deletado com sucesso' });
});

exports.deletePage = catchAsync(async (req, res, next) => {
  const { page_id } = req.params;

  const page = await MangaPage.findByPk(page_id);

  if (!page) {
    throw new AppError('Página não encontrada', 404, 'NOT_FOUND', { resource: 'page', id: page_id });
  }

  // Deletar imagem do disco
  if (page.image_url) {
    const imagePath = path.join(__dirname, '../..', page.image_url);
    try {
      await fs.unlink(imagePath);
    } catch (err) {
      logger.warn('Erro ao deletar imagem de página', { imageUrl: page.image_url });
    }
  }

  await page.destroy();

  logger.info('Página de mangá deletada', {
    userId: req.userId,
    pageId: page_id
  });

  res.json({ message: 'Página deletada com sucesso' });
});
