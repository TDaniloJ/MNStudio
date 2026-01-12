const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const {auth} = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth');

// Listar todas as badges (público)
router.get('/', badgeController.getAllBadges.bind(badgeController));

// Obter badges de um usuário (público)
router.get('/user/:user_id', badgeController.getUserBadges.bind(badgeController));

// Rotas protegidas (requerem autenticação)
router.use(auth);

// Criar badge (admin)
router.post('/', badgeController.createBadge.bind(badgeController));

// Desbloquear badge para usuário (admin)
router.post('/award', badgeController.awardBadge.bind(badgeController));

// Remover badge do usuário (admin)
router.delete('/', badgeController.removeBadge.bind(badgeController));

module.exports = router;
