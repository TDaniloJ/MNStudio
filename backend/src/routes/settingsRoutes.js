const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { auth, isAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Rota pública
router.get('/public', settingsController.getPublicSettings);

// Rotas protegidas (admin apenas)
router.get('/', auth, isAdmin, settingsController.getAllSettings);
router.get('/:key', auth, isAdmin, settingsController.getSetting);
router.put('/:key', auth, isAdmin, upload.single('image'), settingsController.updateSetting);
router.put('/', auth, isAdmin, settingsController.updateMultipleSettings);
router.post('/', auth, isAdmin, settingsController.createSetting);
router.delete('/:key', auth, isAdmin, settingsController.deleteSetting);
router.post('/reset', auth, isAdmin, settingsController.resetToDefaults);

module.exports = router;