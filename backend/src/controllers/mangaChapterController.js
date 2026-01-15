const { MangaChapter, MangaPage, Manga } = require('../models');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// ✅ CONFIGURAÇÃO DO SHARP PARA MELHOR PERFORMANCE
sharp.cache(false);
sharp.concurrency(1);

exports.createChapter = async (req, res) => {
  try {
    const { manga_id } = req.params;
    const { chapter_number, title } = req.body;

    const manga = await Manga.findByPk(manga_id);
    if (!manga) {
      return res.status(404).json({ 
        success: false,
        error: 'Mangá não encontrado' 
      });
    }

    const existingChapter = await MangaChapter.findOne({
      where: { manga_id, chapter_number }
    });
    
    if (existingChapter) {
      return res.status(400).json({ 
        success: false,
        error: 'Capítulo já existe' 
      });
    }

    const chapter = await MangaChapter.create({
      manga_id,
      chapter_number,
      title,
      uploaded_by: req.userId
    });

    res.status(201).json({
      success: true,
      message: 'Capítulo criado com sucesso',
      chapter
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar capítulo:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao criar capítulo' 
    });
  }
};

exports.uploadPages = async (req, res) => {
  const tempFiles = req.files?.map(file => file.path) || [];

  try {
    const { chapter_id } = req.params;

    console.log(`📤 Upload para capítulo ${chapter_id}: ${req.files?.length || 0} arquivos`);

    const chapter = await MangaChapter.findByPk(chapter_id);
    if (!chapter) {
      await cleanupTempFiles(tempFiles);
      return res.status(404).json({ 
        success: false,
        error: 'Capítulo não encontrado' 
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Nenhuma imagem fornecida' 
      });
    }

    const pages = [];
    const failedFiles = [];

    // ✅ PROCESSAMENTO SEQUENCIAL MAIS ROBUSTO
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      try {
        const filename = `chapter-${chapter_id}-page-${i + 1}-${Date.now()}.webp`;
        const outputPath = path.join('uploads/manga', filename);

        // ✅ PROCESSAR IMAGEM
        await sharp(file.path)
          .resize(1200, null, { 
            withoutEnlargement: true,
            fit: 'inside'
          })
          .webp({ 
            quality: 80,
            effort: 4
          })
          .toFile(outputPath);

        // ✅ CRIAR REGISTRO NO BANCO
        const page = await MangaPage.create({
          chapter_id,
          page_number: i + 1,
          image_url: `/uploads/manga/${filename}`
        });

        pages.push(page);
        
        // ✅ DELETAR TEMPORÁRIO IMEDIATAMENTE APÓS SUCESSO
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.warn(`⚠️ Não pude deletar ${path.basename(file.path)}:`, unlinkError.message);
        }

        console.log(`✅ Página ${i + 1} processada: ${filename}`);

      } catch (fileError) {
        console.error(`❌ Falha na página ${i + 1} (${file.originalname}):`, fileError.message);
        failedFiles.push({
          file: file.originalname,
          error: fileError.message
        });
        
        // ✅ TENTAR LIMPAR ARQUIVO TEMPORÁRIO MESMO COM ERRO
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

    console.log(`✅ Upload finalizado: ${pages.length} sucessos, ${failedFiles.length} falhas`);

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

    // ✅ ADICIONAR INFORMAÇÕES DE FALHA SE HOUVER
    if (failedFiles.length > 0) {
      response.failedFiles = failedFiles;
    }

    res.status(201).json(response);

  } catch (error) {
    console.error('❌ Erro geral no upload:', error);
    
    // ✅ LIMPAR ARQUIVOS TEMPORÁRIOS RESTANTES
    await cleanupTempFiles(tempFiles);
    
    res.status(500).json({ 
      success: false,
      error: 'Erro ao fazer upload de páginas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ FUNÇÃO AUXILIAR PARA LIMPEZA DE ARQUIVOS TEMPORÁRIOS
async function cleanupTempFiles(filePaths) {
  if (!filePaths.length) return;

  console.log(`🧹 Limpando ${filePaths.length} arquivos temporários...`);
  
  for (const filePath of filePaths) {
    try {
      await fs.access(filePath);
      
      let deleted = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await fs.unlink(filePath);
          deleted = true;
          console.log(`🗑️ Deletado: ${path.basename(filePath)}`);
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
        console.warn(`❌ Não deletado após 3 tentativas: ${path.basename(filePath)}`);
      }
      
    } catch (accessError) {
      // Arquivo não existe - ignorar
    }
  }
}

exports.getChapterPages = async (req, res) => {
  try {
    const { chapter_id } = req.params;

    console.log(`📖 Buscando páginas do capítulo: ${chapter_id}`);

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
      return res.status(404).json({ 
        success: false,
        error: 'Capítulo não encontrado' 
      });
    }

    // ✅ INCREMENTAR VISUALIZAÇÕES DE FORMA ASSÍNCRONA
    chapter.increment('views').catch(console.error);

    console.log(`✅ ${chapter.pages.length} páginas encontradas`);

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

  } catch (error) {
    console.error('❌ Erro ao buscar páginas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
};

exports.deleteChapter = async (req, res) => {
  try {
    const { chapter_id } = req.params;

    const chapter = await MangaChapter.findByPk(chapter_id, {
      include: [{ model: MangaPage, as: 'pages' }]
    });

    if (!chapter) {
      return res.status(404).json({ 
        success: false,
        error: 'Capítulo não encontrado' 
      });
    }

    // ✅ VERIFICAR PERMISSÕES
    if (req.user.role !== 'admin' && chapter.uploaded_by !== req.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Sem permissão para deletar este capítulo' 
      });
    }

    // ✅ DELETAR IMAGENS DAS PÁGINAS
    const deletePromises = chapter.pages.map(async (page) => {
      if (page.image_url) {
        const imagePath = path.join(__dirname, '../..', page.image_url);
        try {
          await fs.unlink(imagePath);
          console.log(`🗑️ Imagem deletada: ${path.basename(imagePath)}`);
        } catch (err) {
          console.warn(`⚠️ Não pude deletar ${path.basename(imagePath)}:`, err.message);
        }
      }
    });

    await Promise.allSettled(deletePromises);
    await chapter.destroy();

    console.log(`✅ Capítulo ${chapter_id} deletado com sucesso`);

    res.json({ 
      success: true,
      message: 'Capítulo deletado com sucesso' 
    });

  } catch (error) {
    console.error('❌ Erro ao deletar capítulo:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao deletar capítulo' 
    });
  }
};

exports.deletePage = async (req, res) => {
  try {
    const { page_id } = req.params;

    console.log(`🗑️ Deletando página: ${page_id}`);

    const page = await MangaPage.findByPk(page_id, {
      include: [{ model: MangaChapter, as: 'chapter' }]
    });

    if (!page) {
      return res.status(404).json({ 
        success: false,
        error: 'Página não encontrada' 
      });
    }

    // ✅ VERIFICAR PERMISSÕES
    if (req.user.role !== 'admin' && page.chapter.uploaded_by !== req.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Sem permissão para deletar esta página' 
      });
    }

    // ✅ DELETAR ARQUIVO DE IMAGEM
    if (page.image_url) {
      const imagePath = path.join(__dirname, '../..', page.image_url);
      try {
        await fs.unlink(imagePath);
        console.log(`✅ Imagem deletada: ${path.basename(imagePath)}`);
      } catch (err) {
        console.warn(`⚠️ Não pude deletar imagem:`, err.message);
      }
    }

    await page.destroy();

    console.log(`✅ Página ${page_id} deletada`);

    res.json({
      success: true,
      message: 'Página deletada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar página:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// ✅ NOVO: ATUALIZAR CAPÍTULO
exports.updateChapter = async (req, res) => {
  try {
    const { chapter_id } = req.params;
    const { chapter_number, title } = req.body;

    const chapter = await MangaChapter.findByPk(chapter_id);
    if (!chapter) {
      return res.status(404).json({ 
        success: false,
        error: 'Capítulo não encontrado' 
      });
    }

    // ✅ VERIFICAR PERMISSÕES
    if (req.user.role !== 'admin' && chapter.uploaded_by !== req.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Sem permissão para editar este capítulo' 
      });
    }

    // ✅ VERIFICAR SE NOVO NÚMERO JÁ EXISTE
    if (chapter_number && chapter_number !== chapter.chapter_number) {
      const existingChapter = await MangaChapter.findOne({
        where: { 
          manga_id: chapter.manga_id, 
          chapter_number 
        }
      });
      
      if (existingChapter) {
        return res.status(400).json({ 
          success: false,
          error: 'Já existe um capítulo com este número' 
        });
      }
      
      chapter.chapter_number = chapter_number;
    }

    if (title !== undefined) chapter.title = title;

    await chapter.save();

    res.json({
      success: true,
      message: 'Capítulo atualizado com sucesso',
      chapter
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar capítulo:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao atualizar capítulo' 
    });
  }
};