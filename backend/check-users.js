require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkUsers() {
  try {
    console.log('Checking users data...');
    
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Check users data
    const [rows] = await connection.query('SELECT id, name, email, listening_minutes FROM users');
    console.log('Users data:', rows);

    await connection.end();
    console.log('\nCheck completed!\n');
    
  } catch (error) {
    console.error('Failed to check users data:');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();