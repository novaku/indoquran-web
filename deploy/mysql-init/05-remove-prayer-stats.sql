-- Script to remove prayer_stats table and triggers

-- Drop triggers first (they depend on the table)
DROP TRIGGER IF EXISTS `after_prayer_response_insert`;
DROP TRIGGER IF EXISTS `after_prayer_response_delete`;

-- Drop the prayer_stats table
DROP TABLE IF EXISTS `prayer_stats`;

-- Add index for faster counting (if not already exists)
ALTER TABLE `prayer_responses` 
ADD INDEX IF NOT EXISTS `idx_prayer_response_type` (`prayer_id`, `response_type`);

-- Note: After this migration, prayer counts will be computed directly from prayer_responses table
-- using COUNT queries instead of a separate prayer_stats table
