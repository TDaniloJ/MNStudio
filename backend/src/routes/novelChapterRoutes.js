const express = require('express');
const router = express.Router();
const novelChapterController = require('../controllers/novelChapterController');
const { auth, isUploaderOrAdmin } = require('../middlewares/auth');

// Rotas públicas
router.get('/chapters/:chapter_id', novelChapterController.getChapter);

// Rotas protegidas
router.post('/:novel_id/chapters', auth, isUploaderOrAdmin, novelChapterController.createChapter);
router.put('/chapters/:chapter_id', auth, isUploaderOrAdmin, novelChapterController.updateChapter);
router.delete('/chapters/:chapter_id', auth, isUploaderOrAdmin, novelChapterController.deleteChapter);

module.exports = router;