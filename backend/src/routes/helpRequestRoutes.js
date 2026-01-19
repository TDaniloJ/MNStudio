const express = require('express');
const router = express.Router();
const helpRequestController = require('../controllers/helpRequestController');
const { auth } = require('../middlewares/auth');

router.get('/', auth, helpRequestController.getHelpRequests);
router.post('/', auth, helpRequestController.createHelpRequest);
router.put('/:id/read', auth, helpRequestController.markAsRead);
router.put('/read-all', auth, helpRequestController.markAllAsRead);
router.delete('/:id', auth, helpRequestController.deleteHelpRequest);

module.exports = router;
