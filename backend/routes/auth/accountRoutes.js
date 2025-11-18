const express = require('express');
const router = express.Router();
const accountController = require('../../controllers/auth/accountController');

// Account management routes
router.post('/set-password', accountController.isAuthenticated, accountController.setUserPassword);
router.delete('/account', accountController.isAuthenticated, accountController.deleteAccount);
router.get('/test-db', accountController.testDbConnection);

module.exports = router;