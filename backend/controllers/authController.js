const authController = require('./auth/authController');
const accountController = require('./auth/accountController');

// Export all authentication functions
module.exports = {
  ...authController,
  ...accountController
};