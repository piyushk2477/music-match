const pool = require('../../db');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  console.log('Checking authentication status');
  console.log('Session ID:', req.sessionID);
  console.log('Session object:', req.session);
  console.log('Session user:', req.session.user);
  console.log('Cookies:', req.cookies);
  
  if (req.session.user) {
    console.log('Authenticated request from user:', req.session.user.username);
    return next();
  }
  
  console.log('Unauthorized access attempt');
  res.status(401).json({ 
    success: false, 
    message: 'Authentication required' 
  });
};

// Set password for new Spotify users
const setUserPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message: 'User ID and password are required'
      });
    }

    // Validate password (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user exists and doesn't already have a password using subquery
    const [users] = await pool.query(
      'SELECT id, password FROM users WHERE id IN (SELECT id FROM users WHERE id = ?)',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user password (plain text for now, use bcrypt in production) using subquery
    await pool.query(
      'UPDATE users SET password = ? WHERE id IN (SELECT id FROM (SELECT id FROM users WHERE id = ?) AS tmp)',
      [password, userId]
    );

    res.json({
      success: true,
      message: 'Password set successfully'
    });
  } catch (error) {
    console.error('Error setting user password:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting password'
    });
  }
};

// Delete user account and associated data
const deleteAccount = async (req, res) => {
  try {
    console.log('Delete account request received');
    const userId = req.session.user?.id;
    console.log('User ID from session:', userId);
    
    if (!userId) {
      console.log('No user ID found in session');
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    console.log('Attempting to delete account for user ID:', userId);

    // Get database connection
    const connection = await pool.getConnection();
    
    try {
      console.log('Database connection acquired');
      // Start transaction
      await connection.beginTransaction();
      console.log('Transaction started');
      
      // Delete user's favorite artists
      const artistResult = await connection.query(
        'DELETE FROM user_fav_artists WHERE user_id = ?',
        [userId]
      );
      console.log('Deleted favorite artists:', artistResult[0].affectedRows);
      
      // Delete user's favorite songs
      const songResult = await connection.query(
        'DELETE FROM user_fav_songs WHERE user_id = ?',
        [userId]
      );
      console.log('Deleted favorite songs:', songResult[0].affectedRows);
      
      // Delete user (this will also delete associated data due to CASCADE)
      const [result] = await connection.query(
        'DELETE FROM users WHERE id = ?',
        [userId]
      );
      console.log('Deleted user records:', result.affectedRows);
      
      // Commit transaction
      await connection.commit();
      console.log('Transaction committed');
      
      // Destroy session
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        } else {
          console.log('Session destroyed successfully');
        }
      });
      
      res.clearCookie('connect.sid');
      console.log('Cookie cleared');
      
      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      // Rollback transaction on error
      console.error('Error during transaction, rolling back:', error);
      await connection.rollback();
      throw error;
    } finally {
      // Always release the connection back to the pool
      connection.release();
      console.log('Database connection released');
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account'
    });
  }
};

// Test database connection
const testDbConnection = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 as test');
    res.json({ 
      success: true, 
      message: 'Database connection successful',
      data: rows 
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message 
    });
  }
};

module.exports = {
  isAuthenticated,
  setUserPassword,
  deleteAccount,
  testDbConnection
};