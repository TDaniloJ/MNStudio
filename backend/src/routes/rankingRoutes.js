const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');

// Rankings públicos
router.get('/mangas', rankingController.getMangaRankings);
router.get('/novels', rankingController.getNovelRankings);
router.get('/global', rankingController.getGlobalRankings);
router.get('/users', rankingController.getUserRankings);
router.get('/stats', rankingController.getGlobalStats);

module.exports = router;