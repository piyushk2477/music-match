require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixArtistSongTables() {
  try {
    console.log('🔧 Adding spotify_id columns to artists and songs tables...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Add spotify_id to artists table
    try {
      await connection.query(`
        ALTER TABLE artists 
        ADD COLUMN spotify_id VARCHAR(255) UNIQUE
      `);
      console.log('✅ Added spotify_id column to artists table');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  spotify_id column already exists in artists table');
      } else {
        throw err;
      }
    }

    // Add spotify_id to songs table
    try {
      await connection.query(`
        ALTER TABLE songs 
        ADD COLUMN spotify_id VARCHAR(255) UNIQUE
      `);
      console.log('✅ Added spotify_id column to songs table');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  spotify_id column already exists in songs table');
      } else {
        throw err;
      }
    }

    await connection.end();
    console.log('\n🎉 Tables updated successfully!');
    console.log('Try Spotify login again - it should work now!\n');
    
  } catch (error) {
    console.error('❌ Failed to update tables:');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixArtistSongTables();
