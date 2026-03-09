const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { auth } = require('../middlewares/auth');

// Rotas protegidas (requerem autenticação)
router.use(auth);

// Listar atividades do usuário
router.get('/', activityController.getActivities.bind(activityController));

// Obter atividade por id
router.get('/:id', activityController.getActivity.bind(activityController));

// Atualizar atividade
router.put('/:id', activityController.updateActivity.bind(activityController));

// Deletar atividade
// Deletar atividade
router.delete('/:id', activityController.deleteActivity.bind(activityController));

// Limpar histórico de atividades
router.delete('/', activityController.clearActivities.bind(activityController));

// Deletar todos os dados do usuário (GDPR compliant)
router.delete('/account', activityController.deleteAccount.bind(activityController));

module.exports = router;
