import 'server-only'; // This ensures this module is never used on the client side
import mysql from 'mysql2/promise';
import { getEnv } from './env'; // Import from our centralized env utility
import logger from './logger'; // Import our logger

// Connection pool configuration
const poolConfig = {
  host: getEnv('DB_HOST', 'localhost'),
  user: getEnv('DB_USER', 'root'),
  password: getEnv('DB_PASSWORD', 'root'),
  database: getEnv('DB_NAME', 'indoquran_db'),
  port: parseInt(getEnv('DB_PORT', '3306')),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create MySQL connection pool
const pool = mysql.createPool(poolConfig);

// Log connection pool creation
logger.info('MySQL connection pool created', { connectionLimit: poolConfig.connectionLimit });

// Basic query function
export async function query({ query, values = [] }: { query: string; values?: any[] }) {
  const startTime = performance.now();
  try {
    // Execute query
    const [results] = await pool.execute(query, values);
    
    // Calculate duration for performance monitoring (general debug info)
    const duration = Math.round(performance.now() - startTime);
    logger.debug(`Query completed in ${duration}ms`);
    
    return results;
  } catch (error) {
    // Log query errors
    logger.error('Database query error', { query, values, error });
    throw error;
  }
}

// Testing connection function
export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('Database connection successful');
    conn.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Function to initialize the database tables if they don't exist
export async function initDatabase() {
  const createUsersTable = `
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

  const createBookmarksTable = `
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

  const createFavoritesTable = `
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

  const createReadingPositionsTable = `
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
  
  const createContactsTable = `
    CREATE TABLE IF NOT EXISTS contacts (
      contact_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      subject VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      user_id VARCHAR(36) NULL,
      status ENUM('unread', 'read', 'replied', 'archived') DEFAULT 'unread',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await query({ query: createUsersTable });
    await query({ query: createBookmarksTable });
    await query({ query: createFavoritesTable });
    await query({ query: createReadingPositionsTable });
    await query({ query: createContactsTable });
    console.log('Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
    return false;
  }
}

export default {
  query,
  testConnection,
  initDatabase,
};
