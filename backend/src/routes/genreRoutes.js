const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');
const { auth, isAdmin } = require('../middlewares/auth');

// Rotas públicas
router.get('/', genreController.getAllGenres);

// Rotas protegidas (admin)
router.post('/', auth, isAdmin, genreController.createGenre);
router.delete('/:id', auth, isAdmin, genreController.deleteGenre);

module.exports = router;