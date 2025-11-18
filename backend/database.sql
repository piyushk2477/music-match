-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS musicmatch;

-- Use the database
USE musicmatch;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50),
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255),
    spotify_id VARCHAR(255) UNIQUE,
    spotify_access_token TEXT,
    spotify_refresh_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create artists table
CREATE TABLE IF NOT EXISTS artists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    artist_name VARCHAR(255) NOT NULL,
    spotify_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    song_name VARCHAR(255) NOT NULL,
    artist_id INT NOT NULL,
    spotify_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES artists(id)
);

-- Create user favorite artists table
CREATE TABLE IF NOT EXISTS user_fav_artists (
    user_id INT NOT NULL,
    artist_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, artist_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

-- Create user favorite songs table
CREATE TABLE IF NOT EXISTS user_fav_songs (
    user_id INT NOT NULL,
    song_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, song_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- Create backup table for user demographic data
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
);

-- Trigger to backup user data before password update
DELIMITER $$

CREATE TRIGGER backup_user_before_password_update
    BEFORE UPDATE ON users
    FOR EACH ROW
BEGIN
    -- Check if password is being updated
    IF OLD.password != NEW.password THEN
        INSERT INTO users_backup (
            id, name, username, email, password, spotify_id, 
            spotify_access_token, spotify_refresh_token, listening_minutes,
            operation_type, backup_reason
        ) VALUES (
            OLD.id, OLD.name, OLD.username, OLD.email, OLD.password, OLD.spotify_id,
            OLD.spotify_access_token, OLD.spotify_refresh_token, OLD.listening_minutes,
            'UPDATE', 'Password Change'
        );
    END IF;
END$$

-- Trigger to backup user data before account deletion
CREATE TRIGGER backup_user_before_delete
    BEFORE DELETE ON users
    FOR EACH ROW
BEGIN
    INSERT INTO users_backup (
        id, name, username, email, password, spotify_id,
        spotify_access_token, spotify_refresh_token, listening_minutes,
        operation_type, backup_reason
    ) VALUES (
        OLD.id, OLD.name, OLD.username, OLD.email, OLD.password, OLD.spotify_id,
        OLD.spotify_access_token, OLD.spotify_refresh_token, OLD.listening_minutes,
        'DELETE', 'Account Deletion'
    );
END$$

DELIMITER ;