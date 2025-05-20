-- Add search history table for IndoQuran Web Application

USE indoquran_db;

-- Create search history table
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
