-- sqlのindexを張る作業をする予定です。
-- record
ALTER TABLE `record` ADD INDEX idx1(`created_by`, `status`);
-- record_item_file
ALTER TABLE `record_item_file` ADD INDEX idx1(`linked_record_id`, `item_id` asc);
-- session 
ALTER TABLE `session` ADD INDEX idx1(`value`);

ALTER TABLE `record_comment` ADD INDEX idx1(`linked_record_id`);
