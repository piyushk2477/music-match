const express = require('express');
const router = express.Router();
const favoriteController = require('../../controllers/user/favoriteController');
const accountController = require('../../controllers/auth/accountController');

// User favorites routes
router.get('/favorites', accountController.isAuthenticated, favoriteController.getUserFavorites);
router.post('/favorites/artist', accountController.isAuthenticated, favoriteController.addFavoriteArtist);
router.post('/favorites/song', accountController.isAuthenticated, favoriteController.addFavoriteSong);
router.delete('/favorites/artist', accountController.isAuthenticated, favoriteController.removeFavoriteArtist);
router.delete('/favorites/song', accountController.isAuthenticated, favoriteController.removeFavoriteSong);

module.exports = router;