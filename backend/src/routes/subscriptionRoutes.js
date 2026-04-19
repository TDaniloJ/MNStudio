const express = require('express');
const router = express.Router();

const subscriptionController = require('../controllers/subscriptionController');
const { auth } = require('../middlewares/auth');

// 📦 Planos (público)
router.get('/plans', subscriptionController.getPlans);

// 👤 Minha assinatura
router.get('/me', auth, subscriptionController.getMySubscription);

// 🚀 Assinar
router.post('/subscribe', auth, subscriptionController.subscribe);

// ❌ Cancelar
router.post('/cancel', auth, subscriptionController.cancelSubscription);

// Admin routes (protegidas por auth + admin check)
router.post('/plans', auth, subscriptionController.createPlan);
router.put('/plans/:id', auth, subscriptionController.updatePlan);
router.delete('/plans/:id', auth, subscriptionController.deletePlan);

module.exports = router;