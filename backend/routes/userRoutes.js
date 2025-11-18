const express = require('express');
const router = express.Router();

// Import sub-routes
const favoriteRoutes = require('./user/favoriteRoutes');
const profileRoutes = require('./user/profileRoutes');

// Use sub-routes
router.use('/', favoriteRoutes);
router.use('/', profileRoutes);

module.exports = router;