const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all profile routes
router.use(authMiddleware);

// Get user profile
router.get('/', profileController.getUserProfile);

// Update user profile
router.put('/', profileController.updateUserProfile);

module.exports = router;
