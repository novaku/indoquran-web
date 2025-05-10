#!/bin/bash

# MySQL database setup script for indoquran-web
echo "=== Setting up MySQL Database for IndoQuran Web Application ==="
echo "Host: localhost"
echo "Username: root"
echo "Password: root"
echo "Database Name: indoquran_db"
echo ""

# Confirm before proceeding
read -p "Would you like to create the database and tables? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Setup canceled."
    exit 0
fi

# Create the database and tables
mysql -h localhost -u root -proot <<EOF
-- Create database
CREATE DATABASE IF NOT EXISTS indoquran_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE indoquran_db;

-- Create tables
CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE IF NOT EXISTS favorites (
  favorite_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  surah_id INT NOT NULL,
  ayat_number INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, surah_id, ayat_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reading_positions (
  position_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  surah_id INT NOT NULL,
  ayat_number INT NOT NULL,
  last_read TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_position (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Show status
SHOW TABLES;
EOF

if [ $? -eq 0 ]; then
    echo
    echo "✅ Database and tables created successfully!"
    echo
    echo "To use the bookmark and favorite features:"
    echo "1. First run: npm run dev"
    echo "2. Open: http://localhost:3000"
    echo "3. Navigate to a surah page"
    echo "4. Click on the bookmark or favorite icons next to each verse"
    echo "5. View your bookmarks and favorites in the profile page"
    echo
    echo "You can manage your bookmarks and favorites in the profile page: http://localhost:3000/profile"
else
    echo
    echo "❌ Error creating database and tables. Please check your MySQL installation and credentials."
fi
