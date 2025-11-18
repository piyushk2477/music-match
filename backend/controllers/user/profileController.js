const pool = require('../../db');

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

module.exports = {
  getUserSimilarity,
  getAllUsersWithFavorites
};