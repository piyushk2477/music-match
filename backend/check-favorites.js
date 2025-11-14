const pool = require('./db');

async function checkFavorites() {
  try {
    console.log('🔧 Checking favorites data...');
    
    // Check favorite songs count
    const [songRows] = await pool.query('SELECT COUNT(*) as count FROM user_fav_songs');
    console.log('Favorite songs count:', songRows[0].count);
    
    // Check favorite artists count
    const [artistRows] = await pool.query('SELECT COUNT(*) as count FROM user_fav_artists');
    console.log('Favorite artists count:', artistRows[0].count);
    
    // Check if there are any favorites for specific users
    if (songRows[0].count > 0) {
      console.log('\nSample favorite songs:');
      const [sampleSongs] = await pool.query(`
        SELECT ufs.user_id, u.name as user_name, s.song_name, a.artist_name
        FROM user_fav_songs ufs
        JOIN users u ON ufs.user_id = u.id
        JOIN songs s ON ufs.song_id = s.id
        JOIN artists a ON s.artist_id = a.id
        LIMIT 5
      `);
      console.log(sampleSongs);
    }
    
    if (artistRows[0].count > 0) {
      console.log('\nSample favorite artists:');
      const [sampleArtists] = await pool.query(`
        SELECT ufa.user_id, u.name as user_name, a.artist_name
        FROM user_fav_artists ufa
        JOIN users u ON ufa.user_id = u.id
        JOIN artists a ON ufa.artist_id = a.id
        LIMIT 5
      `);
      console.log(sampleArtists);
    }
    
    console.log('\n✅ Check completed!');
    
  } catch (error) {
    console.error('❌ Error checking favorites:', error.message);
  } finally {
    await pool.end();
  }
}

checkFavorites();