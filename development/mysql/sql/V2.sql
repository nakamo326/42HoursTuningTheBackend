
ALTER TABLE `group_member` ADD INDEX idx1(`user_id`, `is_primary`);

-- ALTER TABLE `record` ADD INDEX idx3(`status`);

ALTER TABLE `category_group` ADD INDEX idx1(`group_id`);