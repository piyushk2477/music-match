require('dotenv').config();
const mysql = require('mysql2/promise');

async function addSpotifyColumns() {
  try {
    console.log('Adding Spotify columns to users table...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Add spotify_id column
    try {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN spotify_id VARCHAR(255) UNIQUE AFTER password
      `);
      console.log('Added spotify_id column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  spotify_id column already exists');
      } else {
        throw err;
      }
    }

    // Add spotify_access_token column
    try {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN spotify_access_token TEXT AFTER spotify_id
      `);
      console.log('Added spotify_access_token column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  spotify_access_token column already exists');
      } else {
        throw err;
      }
    }

    // Add spotify_refresh_token column
    try {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN spotify_refresh_token TEXT AFTER spotify_access_token
      `);
      console.log('Added spotify_refresh_token column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  spotify_refresh_token column already exists');
      } else {
        throw err;
      }
    }

    // Make password nullable (for Spotify-only users)
    try {
      await connection.query(`
        ALTER TABLE users 
        MODIFY COLUMN password VARCHAR(255) NULL
      `);
      console.log('Made password column nullable');
    } catch (err) {
      console.log('Could not modify password column:', err.message);
    }

    // Add username column if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN username VARCHAR(50) AFTER name
      `);
      console.log('Added username column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  username column already exists');
      } else {
        throw err;
      }
    }

    await connection.end();
    console.log('\nSpotify columns added successfully!');
    console.log('Restart your backend server and try Spotify login again.\n');
    
  } catch (error) {
    console.error('Failed to add Spotify columns:');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addSpotifyColumns();
