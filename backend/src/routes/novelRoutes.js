// routes/novelRoutes.js - ATUALIZADO  
const express = require('express');
const router = express.Router();
const novelController = require('../controllers/novelController');
const { auth, isUploaderOrAdmin } = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth'); // ✅ NOVO
const upload = require('../middlewares/upload');
const { NovelChapter } = require('../models');

// Rotas públicas COM optionalAuth para tracking
router.get('/', optionalAuth, novelController.getAllNovels); // ✅ optionalAuth
router.get('/:id', optionalAuth, novelController.getNovelById); // ✅ optionalAuth

// Rotas protegidas
router.post('/', auth, isUploaderOrAdmin, upload.single('cover_image'), novelController.createNovel);
router.put('/:id', auth, isUploaderOrAdmin, upload.single('cover_image'), novelController.updateNovel);
router.delete('/:id', auth, isUploaderOrAdmin, novelController.deleteNovel);

// backend/src/routes/novelRoutes.js
router.get('/:id/chapters', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const chapters = await NovelChapter.findAll({
      where: { novel_id: id },
      order: [['chapter_number', 'ASC']]
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

module.exports = router;