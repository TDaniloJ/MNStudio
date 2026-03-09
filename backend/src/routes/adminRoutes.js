const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, isAdmin } = require('../middlewares/auth');

// Users management
router.get('/users', auth, isAdmin, adminController.getAllUsers);
router.get('/users/stats', auth, isAdmin, adminController.getUsersStats);
router.get('/users/:id/stats', auth, isAdmin, adminController.getUserStats);
router.post('/users', auth, isAdmin, adminController.createUser);
router.put('/users/:id', auth, isAdmin, adminController.updateUser);
router.put('/users/:id/role', auth, isAdmin, adminController.updateUserRole);
router.put('/users/:id/status', auth, isAdmin, adminController.updateUserStatus);
router.put('/users/:id/password', auth, isAdmin, adminController.updateUserPassword);
router.delete('/users/:id', auth, isAdmin, adminController.deleteUser);

// Bulk operations
router.post('/users/bulk-delete', auth, isAdmin, adminController.bulkDeleteUsers);
router.post('/users/bulk-role', auth, isAdmin, adminController.bulkUpdateRoles);
router.post('/users/bulk-email', auth, isAdmin, adminController.bulkEmailUsers);
router.get('/users/export', auth, isAdmin, adminController.exportUsers);

module.exports = router;