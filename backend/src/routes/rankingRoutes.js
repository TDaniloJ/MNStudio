const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const ratingController = require('../controllers/ratingController');

// Rankings públicos
router.get('/mangas', rankingController.getMangaRankings);
router.get('/novels', rankingController.getNovelRankings);
router.get('/global', rankingController.getGlobalRankings);
router.get('/users', rankingController.getUserRankings);
router.get('/stats', rankingController.getGlobalStats);

// Ratings
const { auth } = require('../middlewares/auth');
router.post('/ratings', auth, ratingController.submitRating);
router.get('/ratings/:content_type/:content_id', ratingController.getRatingsForContent);

module.exports = router;