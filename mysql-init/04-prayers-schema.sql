-- Prayer System Schema
-- Create prayers table
CREATE TABLE IF NOT EXISTS `prayers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `author_name` VARCHAR(100) NOT NULL,
  `content` TEXT NOT NULL,
  `user_id` VARCHAR(36) NULL, -- Match type with users.user_id
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_created_at` (`created_at`),
  CONSTRAINT `fk_prayer_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create prayer_responses table for amiin/comments
CREATE TABLE IF NOT EXISTS `prayer_responses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `prayer_id` INT NOT NULL,
  `author_name` VARCHAR(100) NOT NULL,
  `user_id` VARCHAR(36) NULL, -- Match with users.user_id
  `content` TEXT NOT NULL,
  `response_type` ENUM('amiin', 'comment') NOT NULL,
  `parent_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_prayer_id` (`prayer_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_parent_id` (`parent_id`),
  CONSTRAINT `fk_response_prayer` FOREIGN KEY (`prayer_id`) 
    REFERENCES `prayers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_response_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_response_parent` FOREIGN KEY (`parent_id`)
    REFERENCES `prayer_responses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index on response_type for faster counting
ALTER TABLE `prayer_responses` 
ADD INDEX `idx_prayer_response_type` (`prayer_id`, `response_type`);

-- Note: We've removed the prayer_stats table and triggers.
-- Instead of using a separate stats table, we now count responses directly 
-- from the prayer_responses table using queries.
