const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Public data routes
router.get('/artists', dataController.getAllArtists);
router.get('/songs', dataController.getAllSongs);

module.exports = router;