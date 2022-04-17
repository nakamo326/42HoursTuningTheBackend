ALTER TABLE `group_member` ADD INDEX idx1(`user_id`, `is_primary`);

-- -- group_member
-- ALTER TABLE `group_member` ADD INDEX idx2(`group_id`);

-- -- category_group
-- ALTER TABLE `category_group` ADD INDEX idx1(`group_id`);

-- ALTER TABLE `record` ADD INDEX idx4(`updated_at` desc, `record_id` asc);
