const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { auth } = require('../middlewares/auth');

// Todas as rotas são protegidas
router.post('/', auth, favoriteController.addFavorite);
router.delete('/:content_type/:content_id', auth, favoriteController.removeFavorite);
router.get('/', auth, favoriteController.getUserFavorites);
router.get('/:type/:id', auth, favoriteController.checkFavorite);

module.exports = router;