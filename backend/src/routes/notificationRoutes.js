const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middlewares/auth');

// Rotas protegidas (requerem autenticação)
router.use(auth);

// Listar notificações do usuário
router.get('/', notificationController.getNotifications.bind(notificationController));

// Marcar notificação como lida
router.put('/:id/read', notificationController.markAsRead.bind(notificationController));

// Marcar todas como lidas
router.put('/read-all', notificationController.markAllAsRead.bind(notificationController));

// Deletar notificação
router.delete('/:id', notificationController.deleteNotification.bind(notificationController));

// Criar notificação (apenas admin)
router.post('/', notificationController.createNotification.bind(notificationController));

// Enviar notificação para múltiplos usuários (apenas admin)
router.post('/broadcast', notificationController.broadcastNotification.bind(notificationController));

module.exports = router;
