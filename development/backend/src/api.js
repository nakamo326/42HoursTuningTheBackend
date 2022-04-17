const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const sharp = require('sharp');

const mysql = require('mysql2/promise');

// MEMO: 設定項目はここを参考にした
// https://github.com/sidorares/node-mysql2#api-and-configuration
// https://github.com/mysqljs/mysql
const mysqlOption = {
  host: 'mysql',
  user: 'backend',
  password: 'backend',
  database: 'app',
  waitForConnections: true,
  connectionLimit: 1000,
};
const pool = mysql.createPool(mysqlOption);

const mylog = (obj) => {
  if (Array.isArray(obj)) {
    for (const e of obj) {
      console.log(e);
    }
    return;
  }
  console.log(obj);
};

const getItems = async (user, recordResult) => {
  const items = Array(recordResult.length);

  const searchUserQs = 'select name from user where user_id = ?';
  const searchGroupQs = 'select name from group_info where group_id = ?';
  const searchThumbQs =
    'select item_id from record_item_file where linked_record_id = ? order by item_id asc limit 1';
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
      resObj.recordId = line.record_id;
      resObj.title = line.title;
      resObj.createdBy = line.created_by;
      resObj.createAt = line.created_at;
      resObj.applicationGroup = line.application_group;
      resObj.updatedAt = line.updated_at;
      //

      const [userResult] = await pool.query(searchUserQs, [resObj.createdBy]);
      if (userResult.length === 1) {
        resObj.createdByName = userResult[0].name;
      }

      const [groupResult] = await pool.query(searchGroupQs, [
        resObj.applicationGroup,
      ]);
      if (groupResult.length === 1) {
        resObj.applicationGroupName = groupResult[0].name;
      }

      const [itemResult] = await pool.query(searchThumbQs, [resObj.recordId]);
      if (itemResult.length === 1) {
        resObj.thumbNailItemId = itemResult[0].item_id;
      }

      const [countResult] = await pool.query(countQs, [resObj.recordId]);
      if (countResult.length === 1) {
        resObj.commentCount = countResult[0]['count(*)'];
      }

      const [lastResult] = await pool.query(searchLastQs, [
        user.user_id,
        resObj.recordId,
      ]);
      if (lastResult.length === 1) {
        const updatedAtNum = Date.parse(resObj.updatedAt);
        const accessTimeNum = Date.parse(lastResult[0].access_time);
        if (updatedAtNum <= accessTimeNum) {
          resObj.isUnConfirmed = false;
        }
      }

      items[i] = resObj;
    })
  );
  return items;
};

const getLinkedUser = async (headers) => {
  const target = headers['x-app-key'];
  const qs = `select * from session where value = ?`;

  const [rows] = await pool.query(qs, [`${target}`]);

  if (rows.length !== 1) {
    return undefined;
  }

  return { user_id: rows[0].linked_user_id };
};

const filePath = 'file/';

// POST /records
// 申請情報登録
const postRecords = async (req, res) => {
  let user = await getLinkedUser(req.headers);

  if (!user) {
    res.status(401).send();
    return;
  }

  const body = req.body;

  let [rows] = await pool.query(
    `select * from group_member where user_id = ?
    AND is_primary = true`,
    [user.user_id]
  );

  if (rows.length !== 1) {
    res.status(400).send();
    return;
  }

  const userPrimary = rows[0];

  const newId = uuidv4();

  await pool.query(
    `insert into record
    (record_id, status, title, detail, category_id, application_group, created_by, created_at, updated_at)
    values (?, "open", ?, ?, ?, ?, ?, now(), now())`,
    [
      `${newId}`,
      `${body.title}`,
      `${body.detail}`,
      body.categoryId,
      userPrimary.group_id,
      user.user_id,
    ]
  );

  for (const e of body.fileIdList) {
    await pool.query(
      `insert into record_item_file
        (linked_record_id, linked_file_id, linked_thumbnail_file_id, created_at)
        values (?, ?, ?, now())`,
      [`${newId}`, `${e.fileId}`, `${e.thumbFileId}`]
    );
  }

  res.send({ recordId: newId });
};

// GET /records/{recordId}
// 文書詳細取得
const getRecord = async (req, res) => {
  let user = await getLinkedUser(req.headers);

  if (!user) {
    res.status(401).send();
    return;
  }

  const recordId = req.params.recordId;

  const recordQs = `select * from record where record_id = ?`;

  const [recordResult] = await pool.query(recordQs, [`${recordId}`]);
  // mylog(recordResult);

  if (recordResult.length !== 1) {
    res.status(404).send({});
    return;
  }

  let recordInfo = {
    recordId: '',
    status: '',
    title: '',
    detail: '',
    categoryId: null,
    categoryName: '',
    applicationGroup: '',
    applicationGroupName: null,
    createdBy: null,
    createdByName: null,
    createdByPrimaryGroupName: null,
    createdAt: null,
    files: [],
  };

  const searchPrimaryGroupQs = `select * from group_member where user_id = ? and is_primary = true`;
  const searchUserQs = `select * from user where user_id = ?`;
  const searchGroupQs = `select * from group_info where group_id = ?`;
  const searchCategoryQs = `select * from category where category_id = ?`;

  const line = recordResult[0];

  const [primaryResult] = await pool.query(searchPrimaryGroupQs, [
    line.created_by,
  ]);
  if (primaryResult.length === 1) {
    const primaryGroupId = primaryResult[0].group_id;

    const [groupResult] = await pool.query(searchGroupQs, [primaryGroupId]);
    if (groupResult.length === 1) {
      recordInfo.createdByPrimaryGroupName = groupResult[0].name;
    }
  }

  const [appGroupResult] = await pool.query(searchGroupQs, [
    line.application_group,
  ]);
  if (appGroupResult.length === 1) {
    recordInfo.applicationGroupName = appGroupResult[0].name;
  }

  const [userResult] = await pool.query(searchUserQs, [line.created_by]);
  if (userResult.length === 1) {
    recordInfo.createdByName = userResult[0].name;
  }

  const [categoryResult] = await pool.query(searchCategoryQs, [
    line.category_id,
  ]);
  if (categoryResult.length === 1) {
    recordInfo.categoryName = categoryResult[0].name;
  }

  recordInfo.recordId = line.record_id;
  recordInfo.status = line.status;
  recordInfo.title = line.title;
  recordInfo.detail = line.detail;
  recordInfo.categoryId = line.category_id;
  recordInfo.applicationGroup = line.application_group;
  recordInfo.createdBy = line.created_by;
  recordInfo.createdAt = line.created_at;

  const searchItemQs = `select * from record_item_file where linked_record_id = ? order by item_id asc`;
  const [itemResult] = await pool.query(searchItemQs, [line.record_id]);
  // mylog('itemResult');
  // mylog(itemResult);

  const searchFileQs = `select * from file where file_id = ?`;
  for (let i = 0; i < itemResult.length; i++) {
    const item = itemResult[i];
    const [fileResult] = await pool.query(searchFileQs, [item.linked_file_id]);

    let fileName = '';
    if (fileResult.length !== 0) {
      fileName = fileResult[0].name;
    }

    recordInfo.files.push({ itemId: item.item_id, name: fileName });
  }

  await pool.query(
    `
	INSERT INTO record_last_access
	(record_id, user_id, access_time)
	VALUES
	(?, ?, now())
	ON DUPLICATE KEY UPDATE access_time = now()`,
    [`${recordId}`, `${user.user_id}`]
  );

  res.send(recordInfo);
};

// GET /record-views/tomeActive
// 自分宛一覧
const tomeActive = async (req, res) => {
  let user = await getLinkedUser(req.headers);

  if (!user) {
    res.status(401).send();
    return;
  }

  let offset = Number(req.query.offset);
  let limit = Number(req.query.limit);

  if (Number.isNaN(offset) || Number.isNaN(limit)) {
    offset = 0;
    limit = 10;
  }

  const m_searchTargetQs = `
    select category_id, application_group
    from category_group as c 
          inner join group_member as g 
          on c.group_id = g.group_id 
    where g.user_id = ?  
  `;

  const m_searchRecordQs = `
    select record_id, title, created_by, created_at, r.application_group as application_group, updated_at 
    from record as r
      inner join
      (${m_searchTargetQs}) as t
      on r.category_id = t.category_id
        and r.application_group = t.application_group
    where status = "open"
    order by updated_at desc, record_id  
    limit ?
    offset ? 
    ;
  `;

  const m_recordCountQs = `
    select count(*) 
    from record as r
      inner join
      (${m_searchTargetQs}) as t
      on r.category_id = t.category_id
        and r.application_group = t.application_group
    where status = "open"
    ;
  `;

  const [recordResult] = await pool.query(m_searchRecordQs, [
    user.user_id,
    limit,
    offset,
  ]);
  // mylog(recordResult);

  const items = await getItems(user, recordResult);
  let count = 0;

  const [recordCountResult] = await pool.query(m_recordCountQs, [user.user_id]);
  if (recordCountResult.length === 1) {
    count = recordCountResult[0]['count(*)'];
  }

  res.send({ count: count, items: items });
};

// GET /record-views/allActive
// 全件一覧
const allActive = async (req, res) => {
  let user = await getLinkedUser(req.headers);

  if (!user) {
    res.status(401).send();
    return;
  }

  let offset = Number(req.query.offset);
  let limit = Number(req.query.limit);

  if (Number.isNaN(offset) || Number.isNaN(limit)) {
    offset = 0;
    limit = 10;
  }
  // TODO: 先に実行
  const searchRecordQs = `select record_id, title, created_by, created_at, application_group, updated_at from record where status = "open" order by updated_at desc, record_id asc limit ? offset ?`;
  const r = pool.query(searchRecordQs, [limit, offset]);
  const recordCountQs = 'select count(*) from record where status = "open"';
  const s = pool.query(recordCountQs);

  const [recordResult] = await r;
  const i = getItems(user, recordResult);

  const [recordCountResult] = await s;
  let count = 0;
  if (recordCountResult.length === 1) {
    count = recordCountResult[0]['count(*)'];
  }

  const items = await i;
  res.send({ count: count, items: items });
};

// GET /record-views/allClosed
// クローズ一覧
const allClosed = async (req, res) => {
  let user = await getLinkedUser(req.headers);

  if (!user) {
    res.status(401).send();
    return;
  }

  let offset = Number(req.query.offset);
  let limit = Number(req.query.limit);

  if (Number.isNaN(offset) || Number.isNaN(limit)) {
    offset = 0;
    limit = 10;
  }

  const searchRecordQs = `select record_id, title, created_by, created_at, application_group, updated_at from record where status = "closed" order by updated_at desc, record_id asc limit ? offset ?`;

  const [recordResult] = await pool.query(searchRecordQs, [limit, offset]);
  // mylog(recordResult);

  const items = await getItems(user, recordResult);
  let count = 0;

  const recordCountQs = 'select count(*) from record where status = "closed"';

  const [recordCountResult] = await pool.query(recordCountQs);
  if (recordCountResult.length === 1) {
    count = recordCountResult[0]['count(*)'];
  }

  res.send({ count: count, items: items });
};

// GET /record-views/mineActive
// 自分が申請一覧
const mineActive = async (req, res) => {
  let user = await getLinkedUser(req.headers);

  if (!user) {
    res.status(401).send();
    return;
  }

  let offset = Number(req.query.offset);
  let limit = Number(req.query.limit);

  if (Number.isNaN(offset) || Number.isNaN(limit)) {
    offset = 0;
    limit = 10;
  }

  const searchRecordQs = `select record_id, title, created_by, created_at, application_group, updated_at from record where created_by = ? and status = "open" order by updated_at desc, record_id asc limit ? offset ?`;

  const [recordResult] = await pool.query(searchRecordQs, [
    user.user_id,
    limit,
    offset,
  ]);
  // mylog(recordResult);

  const items = await getItems(user, recordResult);
  let count = 0;

  const recordCountQs =
    'select count(*) from record where created_by = ? and status = "open"';

  const [recordCountResult] = await pool.query(recordCountQs, [user.user_id]);
  if (recordCountResult.length === 1) {
    count = recordCountResult[0]['count(*)'];
  }

  res.send({ count: count, items: items });
};

// PUT records/{recordId}
// 申請更新
const updateRecord = async (req, res) => {
  let user = await getLinkedUser(req.headers);

  if (!user) {
    res.status(401).send();
    return;
  }

  const recordId = req.params.recordId;
  const status = req.body.status;

  await pool.query(`update record set status = ? where record_id = ?`, [
    `${status}`,
    `${recordId}`,
  ]);

  res.send({});
};

// GET records/{recordId}/comments
// コメントの取得
const getComments = async (req, res) => {
  let user = await getLinkedUser(req.headers);

  if (!user) {
    res.status(401).send();
    return;
  }

  const recordId = req.params.recordId;

  const commentQs = `select comment_id, value, created_by, created_at from record_comment where linked_record_id = ? order by created_at desc`;

  const [commentResult] = await pool.query(commentQs, [`${recordId}`]);

  const commentList = Array(commentResult.length);

  const searchPrimaryGroupQs = `select group_id from group_member where user_id = ? and is_primary = true`;
  const searchUserQs = `select name from user where user_id = ?`;
  const searchGroupQs = `select name from group_info where group_id = ?`;
  await Promise.all(
    commentResult.map(async (line, i) => {
      let commentInfo = {
        commentId: '',
        value: '',
        createdBy: null,
        createdByName: null,
        createdByPrimaryGroupName: null,
        createdAt: null,
      };

      const [primaryResult] = await pool.query(searchPrimaryGroupQs, [
        line.created_by,
      ]);
      if (primaryResult.length === 1) {
        const primaryGroupId = primaryResult[0].group_id;

        const [groupResult] = await pool.query(searchGroupQs, [primaryGroupId]);
        if (groupResult.length === 1) {
          commentInfo.createdByPrimaryGroupName = groupResult[0].name;
        }
      }

      const [userResult] = await pool.query(searchUserQs, [line.created_by]);
      if (userResult.length === 1) {
        commentInfo.createdByName = userResult[0].name;
      }

      commentInfo.commentId = line.comment_id;
      commentInfo.value = line.value;
      commentInfo.createdBy = line.created_by;
      commentInfo.createdAt = line.created_at;

      commentList[i] = commentInfo;
    })
  );

  res.send({ items: commentList });
};

// POST records/{recordId}/comments
// コメントの投稿
const postComments = async (req, res) => {
  let user = await getLinkedUser(req.headers);

  if (!user) {
    res.status(401).send();
    return;
  }

  const recordId = req.params.recordId;
  const value = req.body.value;

  await pool.query(
    `
    insert into record_comment
    (linked_record_id, value, created_by, created_at)
    values (?,?,?, now());`,
    [`${recordId}`, `${value}`, user.user_id]
  );

  await pool.query(
    `
    update record set updated_at = now() where record_id = ?;`,
    [`${recordId}`]
  );

  res.send({});
};

// GET categories/

const expectCategories = {
  1: { name: '緊急の対応が必要' },
  2: { name: '故障・不具合(大型)' },
  3: { name: '故障・不具合(中型・小型)' },
  4: { name: '異常の疑い(大型)' },
  5: { name: '異常の疑い(中型・小型)' },
  6: { name: 'お客様からの問い合わせ' },
  7: { name: 'オフィス外装・インフラ' },
  8: { name: '貸与品関連' },
  9: { name: 'オフィス備品' },
  10: { name: 'その他' },
};

const getCategories = async (req, res) => {
  let user = await getLinkedUser(req.headers);

  if (!user) {
    res.status(401).send();
    return;
  }

  res.send({ items: expectCategories });
};

// POST files/
// ファイルのアップロード
const postFiles = async (req, res) => {
  let user = await getLinkedUser(req.headers);

  if (!user) {
    res.status(401).send();
    return;
  }

  const base64Data = req.body.data;

  const name = req.body.name;

  const newId = uuidv4();
  const newThumbId = uuidv4();

  const binary = Buffer.from(base64Data, 'base64');

  const image = await sharp(binary)
    .png({ palette: true, quality: 80, force: false })
    .jpeg({ quality: 80, force: false });
  const metadata = await image.metadata();
  await image.toFile(`${filePath}${newId}_${name}`, (err, info) => {
    if (info.size < 1024) {
      fs.writeFileSync(`${filePath}${newId}_${name}`, binary);
    }
  });

  const size =
    metadata.width < metadata.height ? metadata.width : metadata.height;
  await image
    .resize(size, size)
    .toFile(`${filePath}${newThumbId}_thumb_${name}`);

  await pool.query(
    `insert into file (file_id, path, name)
        values (?, ?, ?)`,
    [`${newId}`, `${filePath}${newId}_${name}`, `${name}`]
  );
  await pool.query(
    `insert into file (file_id, path, name)
        values (?, ?, ?)`,
    [`${newThumbId}`, `${filePath}${newThumbId}_thumb_${name}`, `thumb_${name}`]
  );

  res.send({ fileId: newId, thumbFileId: newThumbId });
};

// GET records/{recordId}/files/{itemId}
// 添付ファイルのダウンロード
const getRecordItemFile = async (req, res) => {
  let user = await getLinkedUser(req.headers);

  if (!user) {
    res.status(401).send();
    return;
  }

  const recordId = req.params.recordId;
  // mylog(recordId);
  const itemId = Number(req.params.itemId);
  // mylog(itemId);

  const [rows] = await pool.query(
    `select f.name, f.path from record_item_file r
    inner join file f
    on
    r.linked_record_id = ?
    and
    r.item_id = ?
    and
    r.linked_file_id = f.file_id`,
    [`${recordId}`, `${itemId}`]
  );

  if (rows.length !== 1) {
    res.status(404).send({});
    return;
  }
  // mylog(rows[0]);

  const fileInfo = rows[0];
  // mylog(fileInfo)

  const data = fs.readFileSync(fileInfo.path);
  const base64 = data.toString('base64');

  res.send({ data: base64, name: fileInfo.name });
};

// GET records/{recordId}/files/{itemId}/thumbnail
// 添付ファイルのサムネイルダウンロード
const getRecordItemFileThumbnail = async (req, res) => {
  let user = await getLinkedUser(req.headers);

  if (!user) {
    res.status(401).send();
    return;
  }

  const recordId = req.params.recordId;
  // mylog(recordId);
  const itemId = Number(req.params.itemId);
  // mylog(itemId);

  const [rows] = await pool.query(
    `select f.name, f.path from record_item_file r
    inner join file f
    on
    r.linked_record_id = ?
    and
    r.item_id = ?
    and
    r.linked_thumbnail_file_id = f.file_id`,
    [`${recordId}`, `${itemId}`]
  );

  if (rows.length !== 1) {
    res.status(404).send({});
    return;
  }
  // mylog(rows[0]);

  const fileInfo = rows[0];
  // mylog(fileInfo);

  const data = await sharp(fileInfo.path).toBuffer();
  const base64 = data.toString('base64');

  res.send({ data: base64, name: fileInfo.name });
};

module.exports = {
  postRecords,
  getRecord,
  tomeActive,
  allActive,
  allClosed,
  mineActive,
  updateRecord,
  getComments,
  postComments,
  getCategories,
  postFiles,
  getRecordItemFile,
  getRecordItemFileThumbnail,
};
