const pool = require('./db');

// User login (POST with request body)
const loginUser = async (req, res) => {
  console.log('\n🔑 Login request received:', {
    body: req.body,
    headers: req.headers
  });

  // Input validation with better error messages
  if (!req.body.username && !req.body.email) {
    console.log('❌ No username or email provided');
    return res.status(400).json({ 
      success: false, 
      message: 'Email is required' 
    });
  }

  if (!req.body.password) {
    console.log('❌ No password provided');
    return res.status(400).json({ 
      success: false, 
      message: 'Password is required' 
    });
  }

  const { username, email = username, password } = req.body;

  try {
    console.log('🔍 Querying database for user:', username);
    
    // Get database connection
    const connection = await pool.getConnection();
    
    try {
      // Query for user by email
      const [users] = await connection.query(
        'SELECT id, name, email, password FROM users WHERE email = ?',
        [email]
      );
      
      console.log('🔍 Database query results:', { 
        userCount: users.length,
        emailUsed: email
      });
      
      console.log('📊 Database query results:', { userCount: users.length });

      if (users.length === 0) {
        console.log('❌ No user found with email:', username);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password',
          error: 'user_not_found'
        });
      }

      const user = users[0];
      console.log('👤 User found:', { 
        id: user.id, 
        name: user.name,
        email: user.email,
        hasPassword: !!user.password 
      });
      
      // For test user, allow plain text password comparison
      // In production, always use bcrypt.compare()
      const isPasswordValid = user.password === password;
      
      console.log('🔑 Password comparison -', {
        inputLength: password ? password.length : 0,
        isPasswordValid,
        storedLength: user.password ? user.password.length : 0,
        matches: password === user.password
      });
      
      if (!isPasswordValid) {
        console.log('❌ Invalid password for user:', user.email);
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
      console.log('✅ Login successful for user:', username);
      
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
    console.error('🔥 Login error:', {
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
const getCurrentUser = (req, res) => {
  console.log('\n👤 Current session check:', {
    sessionId: req.sessionID,
    hasUser: !!req.session.user,
    userId: req.session.user?.id
  });
  
  if (req.session.user) {
    res.json({ 
      success: true, 
      user: req.session.user,
      sessionId: req.sessionID
    });
  } else {
    console.log('❌ No active session found');
    res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }
};

// Logout user
const logoutUser = (req, res) => {
  const userId = req.session.user?.id;
  console.log('\n🚪 Logout requested for user ID:', userId);
  
  req.session.destroy(err => {
    if (err) {
      console.error('❌ Logout error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error during logout' 
      });
    }
    
    res.clearCookie('connect.sid');
    console.log('✅ User logged out successfully');
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  });
};

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    console.log('🔒 Authenticated request from user:', req.session.user.username);
    return next();
  }
  
  console.log('🔒 Unauthorized access attempt');
  res.status(401).json({ 
    success: false, 
    message: 'Authentication required' 
  });
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

// Get user favorites (songs and artists)
// Get all artists
const getAllArtists = async (req, res) => {
  try {
    const [artists] = await pool.query('SELECT * FROM artists ORDER BY artist_name');
    res.json({
      success: true,
      data: artists
    });
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching artists'
    });
  }
};

// Get all songs with artist names
const getAllSongs = async (req, res) => {
  try {
    const [songs] = await pool.query(`
      SELECT s.id, s.song_name, a.artist_name, a.id as artist_id 
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      ORDER BY s.song_name
    `);
    
    res.json({
      success: true,
      data: songs
    });
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching songs'
    });
  }
};

// Get user favorites
const getUserFavorites = async (req, res) => {
  const userId = req.query.userId;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  try {
    const connection = await pool.getConnection();
    
    // Get favorite artists
    const [artists] = await connection.query(`
      SELECT a.id, a.artist_name 
      FROM artists a
      JOIN user_fav_artists ufa ON a.id = ufa.artist_id
      WHERE ufa.user_id = ?
    `, [userId]);

    // Get favorite songs with artist names
    const [songs] = await connection.query(`
      SELECT s.id, s.song_name, a.artist_name
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      JOIN user_fav_songs ufs ON s.id = ufs.song_id
      WHERE ufs.user_id = ?
    `, [userId]);

    connection.release();

    res.json({
      success: true,
      data: {
        artists,
        songs
      }
    });
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user favorites'
    });
  }
};

// Add favorite artist for user
const addFavoriteArtist = async (req, res) => {
  const { userId, artistId } = req.body;
  
  if (!userId || !artistId) {
    return res.status(400).json({
      success: false,
      message: 'User ID and Artist ID are required'
    });
  }

  try {
    await pool.query(
      'INSERT IGNORE INTO user_fav_artists (user_id, artist_id) VALUES (?, ?)',
      [userId, artistId]
    );
    
    res.json({
      success: true,
      message: 'Artist added to favorites'
    });
  } catch (error) {
    console.error('Error adding favorite artist:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding favorite artist'
    });
  }
};

// Add favorite song for user
const addFavoriteSong = async (req, res) => {
  const { userId, songId } = req.body;
  
  if (!userId || !songId) {
    return res.status(400).json({
      success: false,
      message: 'User ID and Song ID are required'
    });
  }

  try {
    await pool.query(
      'INSERT IGNORE INTO user_fav_songs (user_id, song_id) VALUES (?, ?)',
      [userId, songId]
    );
    
    res.json({
      success: true,
      message: 'Song added to favorites'
    });
  } catch (error) {
    console.error('Error adding favorite song:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding favorite song'
    });
  }
};

// Simple in-memory cache with 5 minute TTL
const similarityCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Calculate similarity between users based on favorite songs with pagination and caching
const getUserSimilarity = async (req, res) => {
  try {
    const { userId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check cache first
    const cacheKey = `similarity:${userId}:${page}:${limit}`;
    const cached = similarityCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return res.json(cached.data);
    }

    // Get current user's favorite songs (only the IDs we need)
    const [currentUserSongs] = await pool.query(
      `SELECT song_id FROM user_fav_songs WHERE user_id = ?`,
      [userId]
    );

    if (currentUserSongs.length === 0) {
      const response = {
        success: true,
        data: {
          currentUser: { id: userId },
          similarities: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            totalPages: 0
          }
        }
      };
      
      // Cache the empty result
      similarityCache.set(cacheKey, {
        timestamp: Date.now(),
        data: response
      });
      
      return res.json(response);
    }

    const currentSongIds = currentUserSongs.map(s => s.song_id);
    const currentSongIdsPlaceholder = currentSongIds.map(() => '?').join(',');

    // Simplified query that's more efficient
    const [similarUsers] = await pool.query(
      `SELECT 
        u.id as userId,
        u.name as userName,
        COUNT(DISTINCT ufs.song_id) as commonSongs,
        ROUND(
          (COUNT(DISTINCT ufs.song_id) / 
          (SELECT COUNT(DISTINCT song_id) FROM user_fav_songs WHERE user_id = u.id + ? - COUNT(DISTINCT ufs.song_id)) * 100),
          2
        ) as similarity
      FROM users u
      JOIN user_fav_songs ufs ON u.id = ufs.user_id AND ufs.song_id IN (${currentSongIdsPlaceholder})
      WHERE u.id != ?
      GROUP BY u.id, u.name
      HAVING commonSongs > 0
      ORDER BY commonSongs DESC
      LIMIT ? OFFSET ?`,
      [
        currentSongIds.length,
        ...currentSongIds,
        userId,
        parseInt(limit),
        parseInt(offset)
      ]
    );

    // Get total count for pagination
    const [totalCount] = await pool.query(
      `SELECT COUNT(DISTINCT u.id) as total
       FROM users u
       JOIN user_fav_songs ufs ON u.id = ufs.user_id
       WHERE u.id != ? AND ufs.song_id IN (${currentSongIdsPlaceholder})`,
      [userId, ...currentSongIds]
    );

    const total = totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Get current user info
    const [currentUser] = await pool.query(
      'SELECT id, name FROM users WHERE id = ?',
      [userId]
    );

    const response = {
      success: true,
      data: {
        currentUser: currentUser[0] || { id: userId },
        similarities: similarUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      }
    };

    // Cache the result
    similarityCache.set(cacheKey, {
      timestamp: Date.now(),
      data: response
    });

  } catch (error) {
    console.error('Error calculating user similarity:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating user similarity'
    });
  }
};

module.exports = {
  loginUser,
  getCurrentUser,
  logoutUser,
  getUserSimilarity,
  isAuthenticated,
  testDbConnection,
  getUserFavorites,
  getAllArtists,
  getAllSongs,
  addFavoriteArtist,
  addFavoriteSong
};
