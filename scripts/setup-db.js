import mysql from 'mysql2/promise';

// Script to create the MySQL database for indoquran-web
async function createDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: 3306
  });

  try {
    console.log('Creating database indoquran_db...');
    await connection.query('CREATE DATABASE IF NOT EXISTS indoquran_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('Database created successfully!');

    // Switch to the newly created database
    await connection.query('USE indoquran_db');

    console.log('Creating tables...');
    
    // Create users table
    await connection.query(`
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
    `);
    console.log('Users table created.');

    // Create bookmarks table
    await connection.query(`
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
    `);
    console.log('Bookmarks table created.');

    // Create favorites table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        favorite_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        surah_id INT NOT NULL,
        ayat_number INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE KEY unique_favorite (user_id, surah_id, ayat_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Favorites table created.');

    // Create reading positions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reading_positions (
        position_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        surah_id INT NOT NULL,
        ayat_number INT NOT NULL,
        last_read TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE KEY unique_position (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Reading positions table created.');

    console.log('All tables created successfully!');
    console.log('\nDatabase setup complete. You can now run the application.');
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await connection.end();
  }
}

createDatabase().catch(console.error);
