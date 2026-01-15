const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middlewares/auth');

router.get('/me/stats', auth, userController.getMyStats);

module.exports = router;
