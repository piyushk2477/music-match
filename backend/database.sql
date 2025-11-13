-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS musicmatch;

-- Use the database
USE musicmatch;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a test user (password: test123)
INSERT INTO users (username, email, password) 
VALUES ('testuser', 'test@example.com', 'test123')
ON DUPLICATE KEY UPDATE username=username, email=email, password='test123';
