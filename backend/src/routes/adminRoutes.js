const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// Public admin routes (no auth required)
router.post('/login', adminController.adminLogin);

// Protected admin routes (auth required)
router.use(adminAuth); // Apply auth middleware to all routes below

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/toggle-verification', adminController.toggleUserVerification);

module.exports = router;
