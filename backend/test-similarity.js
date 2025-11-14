const pool = require('./db');

async function testSimilarity() {
  try {
    console.log('Testing similarity calculation...');
    
    // Get all users
    const [allUsers] = await pool.query('SELECT id, name, email, listening_minutes FROM users ORDER BY id');
    console.log('All users:', allUsers);
    
    // Test the query that's used in getUserSimilarity
    if (allUsers.length > 0) {
      const currentUserId = allUsers[0].id;
      console.log(`\nTesting for user ID: ${currentUserId}`);
      
      // Get all users except current user
      const [otherUsers] = await pool.query(
        'SELECT id, name, email FROM users WHERE id != ? ORDER BY name',
        [currentUserId]
      );
      console.log('Other users:', otherUsers);
      
      // Test the favorite songs query
      const userIds = otherUsers.map(u => u.id);
      console.log('User IDs to query:', userIds);
      
      if (userIds.length > 0) {
        try {
          const [allUserSongs] = await pool.query(
            `SELECT user_id, song_id FROM user_fav_songs WHERE user_id IN (?)`,
            [userIds]
          );
          console.log('Favorite songs result:', allUserSongs);
        } catch (err) {
          console.error('Error with favorite songs query:', err.message);
          
          // Try alternative approach
          console.log('Trying alternative query...');
          const placeholders = userIds.map(() => '?').join(',');
          const [allUserSongs] = await pool.query(
            `SELECT user_id, song_id FROM user_fav_songs WHERE user_id IN (${placeholders})`,
            userIds
          );
          console.log('Alternative favorite songs result:', allUserSongs);
        }
      }
    }
    
    console.log('\nTest completed!');
    
  } catch (error) {
    console.error('Error testing similarity:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testSimilarity();