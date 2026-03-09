const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middlewares/auth');
const activityController = require('../controllers/activityController');

router.get('/me/stats', auth, userController.getMyStats);

// Activities by user (used by frontend)
router.get('/:userId/activities', auth, activityController.getActivitiesByUser.bind(activityController));
router.get('/:userId/activities/recent', auth, activityController.getRecentActivitiesByUser.bind(activityController));

module.exports = router;
