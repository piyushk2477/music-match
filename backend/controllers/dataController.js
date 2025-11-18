const pool = require('../db');

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

module.exports = {
  getAllArtists,
  getAllSongs
};