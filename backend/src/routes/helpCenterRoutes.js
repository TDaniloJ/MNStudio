const express = require('express');
const router = express.Router();
const helpCenterController = require('../controllers/helpCenterController');
const { auth } = require('../middlewares/auth');

router.get('/', auth, helpCenterController.getAllHelpEntries);
router.get('/:id', auth, helpCenterController.getHelpEntryById);
router.post('/', auth, helpCenterController.createHelpEntry);
router.put('/:id', auth, helpCenterController.updateHelpEntry);
router.delete('/:id', auth, helpCenterController.deleteHelpEntry);

module.exports = router;
