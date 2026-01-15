const express = require('express');
const router = express.Router();
const coinController = require('../controllers/coinController');
const { auth, isAdmin } = require('../middlewares/auth');

// Rotas do usuário
router.get('/balance', auth, coinController.getBalance);
router.get('/transactions', auth, coinController.getTransactions);
router.get('/packages', coinController.getPackages);
router.post('/purchase', auth, coinController.purchasePackage);
router.post('/spend', auth, coinController.spendCoins);

// Rotas admin
router.post('/bonus', auth, isAdmin, coinController.addBonus);
router.get('/stats', auth, isAdmin, coinController.getStats);

module.exports = router;