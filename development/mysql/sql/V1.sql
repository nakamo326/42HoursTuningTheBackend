-- sqlのindexを張る作業をする予定です。

-- record
ALTER TABLE `record` ADD INDEX idx1(`category_id`, `application_group`);
ALTER TABLE `record` ADD INDEX idx2(`status`, `updated_at` desc, `record_id` asc);
ALTER TABLE `record` ADD INDEX idx3(`created_by`, `status`, `updated_at` desc, `record_id` asc);

-- record_item_file
ALTER TABLE `record_item_file` ADD INDEX idx1(`linked_record_id`, `item_id` asc);

-- session 
ALTER TABLE `session` ADD INDEX idx1(`value`);

-- record_comment
ALTER TABLE `record_comment` ADD INDEX idx1(`linked_record_id`);

-- -- group_member
ALTER TABLE `group_member` ADD INDEX idx1(`user_id`, `is_primary`);
