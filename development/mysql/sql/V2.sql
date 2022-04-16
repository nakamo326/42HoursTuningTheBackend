-- group_member
ALTER TABLE `group_member` ADD INDEX idx1(`group_id`);
-- ALTER TABLE `group_member` ADD INDEX idx1(`user_id`, `is_primary`);

-- category_group
ALTER TABLE `category_group` ADD INDEX idx1(`group_id`);