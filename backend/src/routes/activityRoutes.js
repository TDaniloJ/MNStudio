const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { auth } = require('../middlewares/auth');

// Rotas protegidas (requerem autenticação)
router.use(auth);

// Listar atividades do usuário
router.get('/', activityController.getActivities.bind(activityController));

// Deletar atividade
router.delete('/:id', activityController.deleteActivity.bind(activityController));

// Limpar histórico de atividades
router.delete('/', activityController.clearActivities.bind(activityController));

module.exports = router;
