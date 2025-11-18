const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/user/profileController');
const accountController = require('../../controllers/auth/accountController');

// User profile routes
router.get('/similarity', accountController.isAuthenticated, profileController.getUserSimilarity);
router.get('/all', accountController.isAuthenticated, profileController.getAllUsersWithFavorites);

module.exports = router;