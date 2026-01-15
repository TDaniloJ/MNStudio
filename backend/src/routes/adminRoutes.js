const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, isAdmin } = require('../middlewares/auth');

router.get('/users', auth, isAdmin, adminController.getAllUsers);
router.put('/users/:id/role', auth, isAdmin, adminController.updateUserRole);
router.delete('/users/:id', auth, isAdmin, adminController.deleteUser);

module.exports = router;