const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/authController');

// User authentication routes
router.post('/login', authController.loginUser);
router.get('/me', authController.getCurrentUser);
router.post('/logout', authController.logoutUser);

module.exports = router;