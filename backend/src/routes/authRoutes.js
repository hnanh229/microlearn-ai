const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/resend-verification', authController.resendVerification);
router.post('/test-email', authController.testEmail);
router.get('/debug-config', authController.debugConfig);
router.post('/check-status', authController.checkStatus);

module.exports = router;
