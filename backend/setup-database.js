require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Create connection without database selected
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log('Database created/verified');

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50),
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255),
        spotify_id VARCHAR(255) UNIQUE,
        spotify_access_token TEXT,
        spotify_refresh_token TEXT,
        listening_minutes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created');

    // Create artists table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS artists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        artist_name VARCHAR(255) NOT NULL,
        spotify_id VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Artists table created');

    // Create songs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS songs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        song_name VARCHAR(255) NOT NULL,
        artist_id INT NOT NULL,
        spotify_id VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (artist_id) REFERENCES artists(id)
      )
    `);
    console.log('Songs table created');

    // Create user_fav_artists table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_fav_artists (
        user_id INT NOT NULL,
        artist_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, artist_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
      )
    `);
    console.log('User favorite artists table created');

    // Create user_fav_songs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_fav_songs (
        user_id INT NOT NULL,
        song_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, song_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
      )
    `);
    console.log('User favorite songs table created');

    // Create users_backup table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users_backup (
        id INT,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50),
        email VARCHAR(150) NOT NULL,
        password VARCHAR(255),
        spotify_id VARCHAR(255),
        spotify_access_token TEXT,
        spotify_refresh_token TEXT,
        listening_minutes INT DEFAULT 0,
        operation_type ENUM('UPDATE', 'DELETE') NOT NULL,
        operation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        backup_reason VARCHAR(100)
      )
    `);
    console.log('Users backup table created');

    await connection.end();
    console.log('\nDatabase setup completed successfully!');
    console.log('You can now start your backend server and try Spotify login.\n');
    
  } catch (error) {
    console.error('Database setup failed:');
    console.error('Error:', error.message);
    console.error('\nPlease check:');
    console.error('1. MySQL is running');
    console.error('2. Credentials in .env are correct');
    console.error('3. MySQL user has proper permissions');
    process.exit(1);
  }
}

setupDatabase();