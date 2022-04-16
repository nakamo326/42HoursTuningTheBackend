
-- nakutemoiikamo
ALTER TABLE `record` ADD INDEX idx3(`record_id`);
ALTER TABLE `group_member` ADD INDEX idx1(`user_id`, `is_primary`);
