// routes/mangaChapterRoutes.js
const express = require('express');
const router = express.Router();
const mangaChapterController = require('../controllers/mangaChapterController');
const { auth, isUploaderOrAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Rotas públicas
router.get('/chapters/:chapter_id/pages', mangaChapterController.getChapterPages);

// Rotas protegidas
router.post('/:manga_id/chapters', auth, isUploaderOrAdmin, mangaChapterController.createChapter);
router.put('/chapters/:chapter_id', auth, isUploaderOrAdmin, mangaChapterController.updateChapter); // ✅ NOVA ROTA
router.post('/chapters/:chapter_id/pages', auth, isUploaderOrAdmin, upload.array('pages', 100), mangaChapterController.uploadPages);
router.delete('/chapters/:chapter_id', auth, isUploaderOrAdmin, mangaChapterController.deleteChapter);
router.delete('/pages/:page_id', auth, isUploaderOrAdmin, mangaChapterController.deletePage);

module.exports = router;