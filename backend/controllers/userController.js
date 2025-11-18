const favoriteController = require('./user/favoriteController');
const profileController = require('./user/profileController');

// Export all user functions
module.exports = {
  ...favoriteController,
  ...profileController
};