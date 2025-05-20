#!/bin/bash

# MySQL database setup script for indoquran-web
echo "=== Setting up MySQL Database for IndoQuran Web Application ==="

# Try to find the environment file in different possible locations
for ENV_FILE in "./deploy/.env.local" "./deploy/.env.production" "./.env.local" "./.env.production"; do
  if [ -f "$ENV_FILE" ]; then
    echo "✅ Found environment file: $ENV_FILE"
    # Source the environment file to get DB configuration
    source "$ENV_FILE"
    DB_HOST=${DB_HOST:-localhost}
    DB_USER=${DB_USER:-root}
    DB_PASSWORD=${DB_PASSWORD:-root}
    DB_NAME=${DB_NAME:-indoquran_db}
    echo "✅ Using database configuration from $ENV_FILE"
    break
  fi
done

# If no env file was found, use defaults
if [ -z "$ENV_FILE" ] || [ ! -f "$ENV_FILE" ]; then
  echo "⚠️ No environment file found"
  echo "Using default database settings."
  DB_HOST="localhost"
  DB_USER="root"
  DB_PASSWORD="root"
  DB_NAME="indoquran_db"
fi

echo "Host: $DB_HOST"
echo "Username: $DB_USER"
echo "Database Name: $DB_NAME"
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
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" <<EOF
-- Create database
CREATE DATABASE IF NOT EXISTS indoquran_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE indoquran_db;

-- Create tables
CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  provider VARCHAR(20) DEFAULT 'credentials',
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