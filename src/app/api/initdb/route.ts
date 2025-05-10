import { NextResponse } from 'next/server';
import { query } from '@/utils/db';

export async function GET() {
  try {
    // Check if the database exists
    try {
      await query({
        query: 'USE indoquran_db'
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Database does not exist. Please create the database first.',
        details: `
          Run the following SQL commands manually to create the database:
          
          CREATE DATABASE IF NOT EXISTS indoquran_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
          
          Then restart the application.
        `
      }, { status: 500 });
    }

    // Create users table
    await query({
      query: `
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
      `
    });

    // Create bookmarks table
    await query({
      query: `
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
      `
    });

    // Create favorites table
    await query({
      query: `
        CREATE TABLE IF NOT EXISTS favorites (
          favorite_id INT AUTO_INCREMENT PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          surah_id INT NOT NULL,
          ayat_number INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          UNIQUE KEY unique_favorite (user_id, surah_id, ayat_number)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `
    });

    // Create reading positions table
    await query({
      query: `
        CREATE TABLE IF NOT EXISTS reading_positions (
          position_id INT AUTO_INCREMENT PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          surah_id INT NOT NULL,
          ayat_number INT NOT NULL,
          last_read TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          UNIQUE KEY unique_position (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `
    });

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully. The database is now ready to use.'
    });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to initialize database',
      error: error.message
    }, { status: 500 });
  }
}
