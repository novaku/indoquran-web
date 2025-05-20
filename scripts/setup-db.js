import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
// Use a simplified logger for scripts
import { logSqlQuery } from '../src/utils/debug-helpers.js';

// Get directory path for correct relative path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to find environment file in multiple possible locations
const possibleEnvPaths = [
  path.resolve(__dirname, '../deploy/.env.local'),
  path.resolve(__dirname, '../.env.local'),
  path.resolve(__dirname, '../deploy/.env.production'),
  path.resolve(__dirname, '../.env.production')
];

const envPath = possibleEnvPaths.find(p => existsSync(p));

if (envPath) {
  console.log(`Loading environment from: ${envPath}`);
  config({ path: envPath });
} else {
  console.warn('No environment file found. Using default configuration.');
}

// Script to create the MySQL database for indoquran-web
async function createDatabase() {
  // Use environment variables or fallback to defaults
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    port: parseInt(process.env.DB_PORT || '3306')
  };
  
  console.log(`Connecting to database at ${dbConfig.host}:${dbConfig.port} as ${dbConfig.user}...`);
  
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('Creating database indoquran_db...');
    const createDbQuery = 'CREATE DATABASE IF NOT EXISTS indoquran_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci';
    logSqlQuery(createDbQuery);
    await connection.query(createDbQuery);
    console.log('Database created successfully!');

    // Switch to the newly created database
    const useDbQuery = 'USE indoquran_db';
    logSqlQuery(useDbQuery);
    await connection.query(useDbQuery);

    console.log('Creating tables...');
    
    // Create users table
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
      user_id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      provider VARCHAR(20) DEFAULT 'credentials',
      image VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    logSqlQuery(createUsersTableQuery);
    await connection.query(createUsersTableQuery);
    console.log('Users table created.');

    // Create bookmarks table
    const createBookmarksTableQuery = `
      CREATE TABLE IF NOT EXISTS bookmarks (
        bookmark_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        surah_id INT NOT NULL,
        ayat_number INT NOT NULL,
        title VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE KEY unique_bookmark (user_id, surah_id, ayat_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    logSqlQuery(createBookmarksTableQuery);
    await connection.query(createBookmarksTableQuery);
    console.log('Bookmarks table created.');

    // Create favorites table
    const createFavoritesTableQuery = `
      CREATE TABLE IF NOT EXISTS favorites (
        favorite_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        surah_id INT NOT NULL,
        ayat_number INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE KEY unique_favorite (user_id, surah_id, ayat_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    logSqlQuery(createFavoritesTableQuery);
    await connection.query(createFavoritesTableQuery);
    console.log('Favorites table created.');

    // Create reading positions table
    const createReadingPositionsTableQuery = `
      CREATE TABLE IF NOT EXISTS reading_positions (
        position_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        surah_id INT NOT NULL,
        ayat_number INT NOT NULL,
        last_read TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE KEY unique_position (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    logSqlQuery(createReadingPositionsTableQuery);
    await connection.query(createReadingPositionsTableQuery);
    console.log('Reading positions table created.');

    // Create search history table
    const createSearchHistoryTableQuery = `
      CREATE TABLE IF NOT EXISTS search_history (
        search_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        query_text VARCHAR(255) NOT NULL,
        search_type ENUM('surah', 'ayat') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        result_count INT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    logSqlQuery(createSearchHistoryTableQuery);
    await connection.query(createSearchHistoryTableQuery);
    console.log('Search history table created.');

    console.log('All tables created successfully!');
    console.log('\nDatabase setup complete. You can now run the application.');
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await connection.end();
  }
}

createDatabase().catch(console.error);
