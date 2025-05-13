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

-- Create prayer_stats table to track metrics
CREATE TABLE IF NOT EXISTS `prayer_stats` (
  `prayer_id` INT PRIMARY KEY,
  `amiin_count` INT DEFAULT 0,
  `comment_count` INT DEFAULT 0,
  `last_activity_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_stats_prayer` FOREIGN KEY (`prayer_id`)
    REFERENCES `prayers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Triggers to update prayer_stats
DELIMITER //

-- Trigger for new responses
CREATE TRIGGER IF NOT EXISTS `after_prayer_response_insert`
AFTER INSERT ON `prayer_responses`
FOR EACH ROW
BEGIN
    IF NEW.response_type = 'amiin' THEN
        INSERT INTO `prayer_stats` (`prayer_id`, `amiin_count`, `last_activity_at`) 
        VALUES (NEW.prayer_id, 1, NOW())
        ON DUPLICATE KEY UPDATE 
            `amiin_count` = `amiin_count` + 1,
            `last_activity_at` = NOW();
    ELSE
        INSERT INTO `prayer_stats` (`prayer_id`, `comment_count`, `last_activity_at`) 
        VALUES (NEW.prayer_id, 1, NOW())
        ON DUPLICATE KEY UPDATE 
            `comment_count` = `comment_count` + 1,
            `last_activity_at` = NOW();
    END IF;
END//

-- Trigger for deleted responses
CREATE TRIGGER IF NOT EXISTS `after_prayer_response_delete`
AFTER DELETE ON `prayer_responses`
FOR EACH ROW
BEGIN
    IF OLD.response_type = 'amiin' THEN
        UPDATE `prayer_stats` 
        SET `amiin_count` = GREATEST(0, `amiin_count` - 1),
            `last_activity_at` = NOW()
        WHERE `prayer_id` = OLD.prayer_id;
    ELSE
        UPDATE `prayer_stats` 
        SET `comment_count` = GREATEST(0, `comment_count` - 1),
            `last_activity_at` = NOW()
        WHERE `prayer_id` = OLD.prayer_id;
    END IF;
END//

DELIMITER ;
