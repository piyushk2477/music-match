const express = require('express');
const router = express.Router();

// Import sub-routes
const authRoutes = require('./auth/authRoutes');
const accountRoutes = require('./auth/accountRoutes');

// Use sub-routes
router.use('/', authRoutes);
router.use('/', accountRoutes);

module.exports = router;