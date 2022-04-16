
ALTER TABLE `group_member` ADD INDEX idx1(`user_id`, `is_primary`);

-- add
ALTER TABLE `group_member` ADD INDEX idx2(`group_id`);

-- add
ALTER TABLE `category_group` ADD INDEX idx1(`group_id`);