const pool = require('../../db');

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

module.exports = {
  getUserFavorites,
  addFavoriteArtist,
  addFavoriteSong,
  removeFavoriteArtist,
  removeFavoriteSong
};