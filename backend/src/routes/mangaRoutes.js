// routes/mangaRoutes.js - ATUALIZADO
const express = require('express');
const router = express.Router();
const mangaController = require('../controllers/mangaController');
const { auth, isUploaderOrAdmin } = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth'); // ✅ NOVO
const { MangaChapter, MangaPage } = require('../models');
const upload = require('../middlewares/upload');

// Rotas públicas COM optionalAuth para tracking
router.get('/', optionalAuth, mangaController.getAllMangas); // ✅ optionalAuth
router.get('/:id', optionalAuth, mangaController.getMangaById); // ✅ optionalAuth

// Rotas protegidas
router.post('/', auth, isUploaderOrAdmin, upload.single('cover_image'), mangaController.createManga);
router.put('/:id', auth, isUploaderOrAdmin, upload.single('cover_image'), mangaController.updateManga);
router.delete('/:id', auth, isUploaderOrAdmin, mangaController.deleteManga);

// backend/src/routes/mangaRoutes.js
router.get('/:id/chapters', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const chapters = await MangaChapter.findAll({
      where: { manga_id: id },
      order: [['chapter_number', 'ASC']],
      include: [
        {
          model: MangaPage,
          as: 'pages',
          attributes: ['id', 'page_number', 'image_url']
        }
      ]
    });

    res.json({ 
      success: true,
      chapters,
      count: chapters.length 
    });
  } catch (error) {
    console.error('Erro ao buscar capítulos:', error);
    res.status(500).json({ error: 'Erro ao buscar capítulos' });
  }
});

router.patch('/chapters/:chapterId/pages/reorder', auth, isUploaderOrAdmin, async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { pages } = req.body; // Array de { id, page_number }

    if (!pages || !Array.isArray(pages)) {
      return res.status(400).json({ error: 'Array de páginas inválido' });
    }

    // Busca o capítulo
    const chapter = await MangaChapter.findByPk(chapterId);
    
    if (!chapter) {
      return res.status(404).json({ error: 'Capítulo não encontrado' });
    }

    // Verifica permissão
    const manga = await Manga.findByPk(chapter.manga_id);
    if (req.user.role !== 'admin' && manga.uploader_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para modificar este mangá' });
    }

    // Atualiza a ordem de cada página
    await Promise.all(
      pages.map(({ id, page_number }) =>
        MangaPage.update(
          { page_number },
          { where: { id, chapter_id: chapterId } }
        )
      )
    );

    // Retorna as páginas atualizadas
    const updatedPages = await MangaPage.findAll({
      where: { chapter_id: chapterId },
      order: [['page_number', 'ASC']]
    });

    res.json({
      success: true,
      message: 'Páginas reordenadas com sucesso',
      pages: updatedPages
    });
  } catch (error) {
    console.error('Erro ao reordenar páginas:', error);
    res.status(500).json({ error: 'Erro ao reordenar páginas' });
  }
});

module.exports = router;