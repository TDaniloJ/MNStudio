const express = require('express');
const router = express.Router();
const readingHistoryController = require('../controllers/readingHistoryController');
const { auth } = require('../middlewares/auth');

// Todas as rotas são protegidas
router.post('/', auth, readingHistoryController.saveReadingProgress);
router.get('/', auth, readingHistoryController.getReadingHistory);
router.delete('/', auth, readingHistoryController.clearHistory);

module.exports = router;