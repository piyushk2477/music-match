const pool = require('../../db');

// User login (POST with request body)
const loginUser = async (req, res) => {
  console.log('\nLogin request received:', {
    body: req.body,
    headers: req.headers
  });

  // Input validation with better error messages
  if (!req.body.username && !req.body.email) {
    console.log('No username or email provided');
    return res.status(400).json({ 
      success: false, 
      message: 'Email is required' 
    });
  }

  if (!req.body.password) {
    console.log('No password provided');
    return res.status(400).json({ 
      success: false, 
      message: 'Password is required' 
    });
  }

  const { username, email = username, password } = req.body;

  try {
    console.log('Querying database for user:', username);
    
    // Get database connection
    const connection = await pool.getConnection();
    
    try {
      // Query for user by email using subquery
      const [users] = await connection.query(
        'SELECT id, name, email, password FROM users WHERE email IN (SELECT email FROM users WHERE email = ?)',
        [email]
      );
      
      console.log('Database query results:', { 
        userCount: users.length,
        emailUsed: email
      });
      
      console.log('Database query results:', { userCount: users.length });

      if (users.length === 0) {
        console.log('No user found with email:', username);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password',
          error: 'user_not_found'
        });
      }

      const user = users[0];
      console.log('User found:', { 
        id: user.id, 
        name: user.name,
        email: user.email,
        hasPassword: !!user.password 
      });
      
      // For test user, allow plain text password comparison
      // In production, always use bcrypt.compare()
      const isPasswordValid = user.password === password;
      
      console.log('Password comparison -', {
        inputLength: password ? password.length : 0,
        isPasswordValid,
        storedLength: user.password ? user.password.length : 0,
        matches: password === user.password
      });
      
      if (!isPasswordValid) {
        console.log('Invalid password for user:', user.email);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password',
          error: 'invalid_credentials'
        });
      }

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;
      
      // Set user in session
      req.session.user = userWithoutPassword;
      console.log('Login successful for user:', username);
      
      // Send response
      res.json({ 
        success: true,
        user: userWithoutPassword,
        sessionId: req.sessionID
      });
      
    } finally {
      // Always release the connection back to the pool
      connection.release();
    }
    
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      code: error.code,
      sql: error.sql,
      stack: error.stack
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        code: error.code 
      })
    });
  }
};

// Get current user from session
const getCurrentUser = async (req, res) => {
  console.log('\nCurrent session check:', {
    sessionId: req.sessionID,
    hasUser: !!req.session.user,
    userId: req.session.user?.id
  });
  
  if (req.session.user) {
    try {
      // Fetch listening minutes from database using subquery
      const [users] = await pool.query(
        'SELECT listening_minutes FROM users WHERE id IN (SELECT id FROM users WHERE id = ?)',
        [req.session.user.id]
      );
      
      // Add listening minutes to user object if found
      const userWithListeningData = {
        ...req.session.user,
        listening_minutes: users.length > 0 ? users[0].listening_minutes : 0
      };
      
      res.json({ 
        success: true, 
        user: userWithListeningData,
        sessionId: req.sessionID
      });
    } catch (error) {
      console.error('Error fetching user listening data:', error);
      // Return user without listening data if there's an error
      res.json({ 
        success: true, 
        user: req.session.user,
        sessionId: req.sessionID
      });
    }
  } else {
    console.log('No active session found');
    res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }
};

// Logout user
const logoutUser = (req, res) => {
  const userId = req.session.user?.id;
  console.log('\nLogout requested for user ID:', userId);
  
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error during logout' 
      });
    }
    
    res.clearCookie('connect.sid');
    console.log('User logged out successfully');
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  });
};

module.exports = {
  loginUser,
  getCurrentUser,
  logoutUser
};