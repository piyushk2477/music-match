require('dotenv').config();
const mysql = require('mysql2/promise');

async function addListeningMinutesColumn() {
  try {
    console.log('Adding listening_minutes column to users table...');
    
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Add listening_minutes column
    try {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN listening_minutes INT DEFAULT 0
      `);
      console.log('Added listening_minutes column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  listening_minutes column already exists');
      } else {
        throw err;
      }
    }

    await connection.end();
    console.log('\nListening minutes column added successfully!\n');
    
  } catch (error) {
    console.error('Failed to add listening minutes column:');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addListeningMinutesColumn();