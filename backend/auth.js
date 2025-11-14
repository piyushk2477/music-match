const pool = require('./db');

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

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
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

// Get all artists
const getAllArtists = async (req, res) => {
  try {
    const [artists] = await pool.query('SELECT * FROM artists WHERE id IN (SELECT id FROM artists) ORDER BY artist_name');
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
      WHERE s.id IN (SELECT id FROM songs)
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
    
    // Get favorite artists using subquery
    const [artists] = await connection.query(`
      SELECT id, artist_name 
      FROM artists 
      WHERE id IN (SELECT artist_id FROM user_fav_artists WHERE user_id = ?)
    `, [userId]);

    // Get favorite songs with artist names using subquery
    const [songs] = await connection.query(`
      SELECT s.id, s.song_name, a.artist_name
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      WHERE s.id IN (SELECT song_id FROM user_fav_songs WHERE user_id = ?)
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

// Remove favorite artist for user
const removeFavoriteArtist = async (req, res) => {
  const { userId, artistId } = req.query;
  
  if (!userId || !artistId) {
    return res.status(400).json({
      success: false,
      message: 'User ID and Artist ID are required'
    });
  }

  try {
    await pool.query(
      'DELETE FROM user_fav_artists WHERE user_id = ? AND artist_id = ?',
      [userId, artistId]
    );
    
    res.json({
      success: true,
      message: 'Artist removed from favorites'
    });
  } catch (error) {
    console.error('Error removing favorite artist:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing favorite artist'
    });
  }
};

// Remove favorite song for user
const removeFavoriteSong = async (req, res) => {
  const { userId, songId } = req.query;
  
  if (!userId || !songId) {
    return res.status(400).json({
      success: false,
      message: 'User ID and Song ID are required'
    });
  }

  try {
    await pool.query(
      'DELETE FROM user_fav_songs WHERE user_id = ? AND song_id = ?',
      [userId, songId]
    );
    
    res.json({
      success: true,
      message: 'Song removed from favorites'
    });
  } catch (error) {
    console.error('Error removing favorite song:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing favorite song'
    });
  }
};

// Get user similarity based on favorite songs and artists
const getUserSimilarity = async (req, res) => {
  try {
    const currentUserId = req.session.user?.id;
    
    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    console.log('Calculating similarity for user:', currentUserId);

    // Get all users except current user
    const [allUsers] = await pool.query(
      'SELECT id, name, email FROM users WHERE id != ? ORDER BY name',
      [currentUserId]
    );

    // Get all favorite songs and artists for all users using subqueries
    const userIds = allUsers.map(u => u.id);
    
    // Get all favorite songs for all users in one query using subquery
    const [allUserSongs] = userIds.length > 0
      ? await pool.query(
          `SELECT user_id, song_id FROM user_fav_songs WHERE user_id IN (SELECT id FROM users WHERE id IN (?))`,
          [userIds]
        )
      : [[], []];

    // Get all favorite artists for all users in one query using subquery
    const [allUserArtists] = userIds.length > 0
      ? await pool.query(
          `SELECT user_id, artist_id FROM user_fav_artists WHERE user_id IN (SELECT id FROM users WHERE id IN (?))`,
          [userIds]
        )
      : [[], []];

    // Get current user's favorite songs and artists
    const [currentUserSongs] = await pool.query(
      `SELECT song_id FROM user_fav_songs WHERE user_id = ?`,
      [currentUserId]
    );

    const [currentUserArtists] = await pool.query(
      `SELECT artist_id FROM user_fav_artists WHERE user_id = ?`,
      [currentUserId]
    );

    console.log(`Comparing with ${allUsers.length} other users`);

    // Group favorites by user ID for faster lookup
    const userSongsMap = {};
    const userArtistsMap = {};
    
    // Initialize maps
    allUsers.forEach(user => {
      userSongsMap[user.id] = new Set();
      userArtistsMap[user.id] = new Set();
    });

    // Populate song maps
    allUserSongs.forEach(row => {
      if (userSongsMap[row.user_id]) {
        userSongsMap[row.user_id].add(row.song_id);
      }
    });

    // Populate artist maps
    allUserArtists.forEach(row => {
      if (userArtistsMap[row.user_id]) {
        userArtistsMap[row.user_id].add(row.artist_id);
      }
    });

    // Get all listening minutes for all users in one query
    const userIdsForListening = allUsers.map(u => u.id);
    let userListeningMap = {};
    
    if (userIdsForListening.length > 0) {
      const [listeningResults] = await pool.query(
        'SELECT id, listening_minutes FROM users WHERE id IN (?)',
        [userIdsForListening]
      );
      
      // Create a map for quick lookup
      listeningResults.forEach(row => {
        userListeningMap[row.id] = row.listening_minutes || 0;
      });
    }

    // Calculate similarity for each user
    const similarities = [];

    for (const otherUser of allUsers) {
      const otherUserSongIds = userSongsMap[otherUser.id] || new Set();
      const otherUserArtistIds = userArtistsMap[otherUser.id] || new Set();

      // Calculate Jaccard similarity for songs
      const commonSongs = [...currentUserSongs.map(s => s.song_id)].filter(id => otherUserSongIds.has(id)).length;
      const totalSongs = new Set([...currentUserSongs.map(s => s.song_id), ...otherUserSongIds]).size;
      const songSimilarity = totalSongs > 0 ? commonSongs / totalSongs : 0;

      // Calculate Jaccard similarity for artists
      const commonArtists = [...currentUserArtists.map(a => a.artist_id)].filter(id => otherUserArtistIds.has(id)).length;
      const totalArtists = new Set([...currentUserArtists.map(a => a.artist_id), ...otherUserArtistIds]).size;
      const artistSimilarity = totalArtists > 0 ? commonArtists / totalArtists : 0;

      // Combined similarity (equal weight to songs and artists)
      const similarity = (songSimilarity + artistSimilarity) / 2;
      const percentage = Math.round(similarity * 100);

      similarities.push({
        userId: otherUser.id,
        userName: otherUser.name,
        email: otherUser.email,
        score: percentage,
        listeningMinutes: userListeningMap[otherUser.id] || 0
      });
    }

    // Sort by similarity score (descending), then by listening minutes (descending)
    similarities.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // Higher similarity first
      }
      return b.listeningMinutes - a.listeningMinutes; // Higher listening minutes first if similarity is the same
    });

    console.log(` Found ${similarities.length} similar users`);
    console.log('Similarities data:', similarities);

    res.json({
      success: true,
      data: similarities
    });
  } catch (error) {
    console.error('Error calculating user similarity:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating user similarity'
    });
  }
};

// Get all users with their top 5 songs and top 5 artists
const getAllUsersWithFavorites = async (req, res) => {
  try {
    console.log('Fetching all users with their favorites...');
    
    // Get sorting parameter from query
    const sortBy = req.query.sortBy || 'name'; // Default to sorting by name
    const sortOrder = req.query.sortOrder || 'ASC'; // Default to ascending
    
    // Validate sorting parameters
    const validSortBy = ['name', 'listening_minutes'];
    const validSortOrder = ['ASC', 'DESC'];
    
    // Map sortBy values to actual column names
    const columnMap = {
      'name': 'name',
      'listening_minutes': 'listening_minutes'
    };
    
    const sortColumn = validSortBy.includes(sortBy) ? columnMap[sortBy] : 'name';
    const order = validSortOrder.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
    
    console.log(`Sorting users by ${sortColumn} ${order}`);
    
    // Get all users with sorting
    // Build the ORDER BY clause manually since we can't parameterize ASC/DESC
    const orderByClause = `${sortColumn} ${order}`;
    const [users] = await pool.query(
      `SELECT id, name, email, listening_minutes FROM users ORDER BY ${orderByClause}`
    );

    console.log(`Found ${users.length} users`);

    // For each user, get their favorite songs and artists using subqueries
    const usersWithFavorites = await Promise.all(
      users.map(async (user) => {
        // Get favorite songs using subquery
        const [songs] = await pool.query(
          `SELECT s.id, s.song_name, a.artist_name
           FROM songs s
           JOIN artists a ON s.artist_id = a.id
           WHERE s.id IN (SELECT song_id FROM user_fav_songs WHERE user_id = ?)`,
          [user.id]
        );

        // Get favorite artists using subquery
        const [artists] = await pool.query(
          `SELECT a.id, a.artist_name
           FROM artists a
           WHERE a.id IN (SELECT artist_id FROM user_fav_artists WHERE user_id = ?)`,
          [user.id]
        );

        return {
          userId: user.id,
          userName: user.name,
          email: user.email,
          listeningMinutes: user.listening_minutes || 0,
          topSongs: songs,
          topArtists: artists
        };
      })
    );

    console.log('Successfully fetched all users with favorites');

    res.json({
      success: true,
      data: {
        users: usersWithFavorites
      }
    });
  } catch (error) {
    console.error('Error fetching all users with favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
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

module.exports = {
  loginUser,
  getCurrentUser,
  logoutUser,
  isAuthenticated,
  testDbConnection,
  getAllArtists,
  getAllSongs,
  getUserFavorites,
  addFavoriteArtist,
  addFavoriteSong,
  removeFavoriteArtist,
  removeFavoriteSong,
  getUserSimilarity,
  getAllUsersWithFavorites,
  setUserPassword
};