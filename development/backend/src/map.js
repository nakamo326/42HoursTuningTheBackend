const getItems = async (user, recordResult) => {
  console.log(recordResult.length);
  const items = Array(recordResult.length);

  // 'select name from user where user_id = ?';
  const searchUserQs = 'select * from user where user_id = ?';
  // 'select name from group_info where group_id = ?';
  const searchGroupQs = 'select * from group_info where group_id = ?';
  // 'select item_id from record_item_file where linked_record_id = ? order by item_id asc limit 1';
  const searchThumbQs =
    'select * from record_item_file where linked_record_id = ? order by item_id asc limit 1';
  const countQs =
    'select count(*) from record_comment where linked_record_id = ?';
  const searchLastQs =
    'select * from record_last_access where user_id = ? and record_id = ?';

  await Promise.all(
    recordResult.map(async (record, i) => {
      const resObj = {
        recordId: null,
        title: '',
        applicationGroup: null,
        applicationGroupName: null,
        createdBy: null,
        createdByName: null,
        createAt: '',
        commentCount: 0,
        isUnConfirmed: true,
        thumbNailItemId: null,
        updatedAt: '',
      };

      const line = record;
      // recordResultで必要なカラムはこれだけ？
      const recordId = line.record_id;
      const createdBy = line.created_by;
      const applicationGroup = line.application_group;
      const updatedAt = line.updated_at;
      //
      let createdByName = null;
      let applicationGroupName = null;
      let thumbNailItemId = null;
      let commentCount = 0;
      let isUnConfirmed = true;

      const [userResult] = await pool.query(searchUserQs, [createdBy]);
      if (userResult.length === 1) {
        createdByName = userResult[0].name;
      }

      const [groupResult] = await pool.query(searchGroupQs, [applicationGroup]);
      if (groupResult.length === 1) {
        applicationGroupName = groupResult[0].name;
      }

      const [itemResult] = await pool.query(searchThumbQs, [recordId]);
      if (itemResult.length === 1) {
        thumbNailItemId = itemResult[0].item_id;
      }

      const [countResult] = await pool.query(countQs, [recordId]);
      if (countResult.length === 1) {
        commentCount = countResult[0]['count(*)'];
      }

      const [lastResult] = await pool.query(searchLastQs, [
        user.user_id,
        recordId,
      ]);
      if (lastResult.length === 1) {
        const updatedAtNum = Date.parse(updatedAt);
        const accessTimeNum = Date.parse(lastResult[0].access_time);
        if (updatedAtNum <= accessTimeNum) {
          isUnConfirmed = false;
        }
      }

      resObj.recordId = recordId;
      resObj.title = line.title;
      resObj.applicationGroup = applicationGroup;
      resObj.applicationGroupName = applicationGroupName;
      resObj.createdBy = createdBy;
      resObj.createdByName = createdByName;
      resObj.createAt = line.created_at;
      resObj.commentCount = commentCount;
      resObj.isUnConfirmed = isUnConfirmed;
      resObj.thumbNailItemId = thumbNailItemId;
      resObj.updatedAt = updatedAt;

      items[i] = resObj;
    })
  );
  return items;
};

module.exports = getItems;
