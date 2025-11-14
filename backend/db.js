const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root123',
  database: process.env.DB_NAME || 'musicmatch',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds
  multipleStatements: true
};

console.log('Database connection details:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  hasPassword: !!dbConfig.password
});

const pool = mysql.createPool(dbConfig);

// Test the database connection
async function testConnection() {
  let connection;
  try {
    console.log('Attempting to connect to the database...');
    
    // Get a connection from the pool
    connection = await pool.getConnection();
    console.log('Successfully connected to the database!');
    
    // Check if the database exists
    const [dbs] = await connection.query('SHOW DATABASES');
    console.log('Available databases:', dbs.map(db => db.Database));
    
    const dbExists = dbs.some(db => db.Database === dbConfig.database);
    
    if (!dbExists) {
      console.warn(`Database '${dbConfig.database}' does not exist.`);
      console.log('Attempting to create database...');
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
      console.log(`Database '${dbConfig.database}' created successfully.`);
    }
    
    // Select the database
    await connection.query(`USE \`${dbConfig.database}\``);
    
    // Check if users table exists and log its structure
    console.log('Checking users table structure...');
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [dbConfig.database]);
    
    // Log the structure of the users table if it exists
    if (tables.length > 0) {
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT, EXTRA 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
      `, [dbConfig.database]);
      
      console.log('Users table structure:', columns);
    }
    
    if (tables.length === 0) {
      console.log('Creating users table...');
      await connection.query(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Users table created successfully');
    } else {
      console.log('Users table exists');
    }
    
    // Show some stats
    const [[{count}]] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`Total users in database: ${count}`);
    
  } catch (error) {
    console.error('Error connecting to MySQL database:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // More detailed error handling
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('The database does not exist. Please create it first.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Please check your database credentials.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Is MySQL server running?');
    }
    
    process.exit(1); // Exit with error
  } finally {
    if (connection) await connection.release();
  }
}

// Run the connection test
testConnection().catch(console.error);

module.exports = pool;
