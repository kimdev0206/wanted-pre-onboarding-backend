const database = require("../database");

function PostRepository() {}

PostRepository.prototype.insertPost = async function (params) {
  const pool = database.pool;
  const query = `
    INSERT INTO posts
      (
        user_seq,
        title, 
        content
      )
    VALUES
      (?, ?, ?);
  `;

  const values = [params.userSeq, params.title, params.content];
  const [result] = await pool.query(query, values);
  return result;
};

PostRepository.prototype.insertPostWithPK = async function (params) {
  const pool = database.pool;
  const query = `
    INSERT INTO posts
      (
        post_seq,
        super_seq,
        user_seq,
        title,
        content
      )
    VALUES
      (?, ?, ?, ?, ?);
  `;

  const values = [
    params.postSeq,
    params.superSeq,
    params.userSeq,
    params.title,
    params.content,
  ];
  await pool.query(query, values);
};

PostRepository.prototype.selectPosts = async function (params) {
  const pool = database.pool;
  let query = `
    SELECT 
      p.post_seq AS postSeq,
      p.title AS title,
      u.email AS email
    FROM 
      users AS u
    LEFT JOIN 
      posts AS p
      ON u.user_seq = p.user_seq
  `;

  let values = [];

  if (params.limit && !isNaN(params.offset)) {
    query += "LIMIT ? OFFSET ?";
    values.push(params.limit, params.offset);
  }

  query + ";";

  const [result] = await pool.query(query, values);
  return result;
};

PostRepository.prototype.selectPostsCount = async function () {
  const pool = database.pool;
  const query = `
    SELECT
      COUNT(post_seq) AS totalSize
    FROM
      posts;
  `;

  const [result] = await pool.query(query);
  return result;
};

PostRepository.prototype.selectSubs = async function (postSeq) {
  const pool = database.pool;
  const query = `
    SELECT
      post_seq AS postSeq
    FROM
      posts
    WHERE
      super_seq = ?;
  `;

  const values = [postSeq];
  const [result] = await pool.query(query, values);
  return result;
};

PostRepository.prototype.selectSupers = async function (postSeq) {
  const pool = database.pool;
  const query = `
    WITH RECURSIVE cte AS (
      SELECT
        post_seq,
        super_seq
      FROM
        posts
      WHERE
        post_seq = ?
      UNION ALL
      SELECT
        p.post_seq,
        p.super_seq
      FROM
        posts AS p
      INNER JOIN 
        cte AS c
        ON p.post_seq = c.super_seq
    )
    SELECT
      post_seq AS postSeq
    FROM cte;
  `;

  const values = [postSeq];
  const [result] = await pool.query(query, values);
  return result;
};

PostRepository.prototype.selectPost = async function (params) {
  const pool = database.pool;
  let query = `
    SELECT
      p.title AS title,
      p.content AS content,
      u.email AS email,
      u.user_seq AS userSeq
    FROM 
      users AS u
    INNER JOIN
      posts AS p
      ON u.user_seq = p.user_seq
    WHERE 
      p.post_seq = ?
  `;

  let values = [params.postSeq];

  if (params.userSeq) {
    query += "AND u.user_seq = ?";
    values.push(params.userSeq);
  }

  query += ";";

  const [result] = await pool.query(query, values);
  return result;
};

PostRepository.prototype.updatePost = async function (params) {
  const pool = database.pool;
  const query = `
    UPDATE 
      posts
    SET
      title = ?,
      content = ?
    WHERE 
      user_seq = ?
      AND post_seq = ?;
  `;

  const values = [params.title, params.content, params.userSeq, params.postSeq];
  const [result] = await pool.query(query, values);
  return result;
};

PostRepository.prototype.updateSupers = async function (params) {
  const pool = database.pool;
  const query = `
    UPDATE
      posts
    SET
      super_seq = ?
    WHERE 
      user_seq = ?
      AND post_seq = ?;
  `;

  const values = [params.superSeq, params.userSeq, params.postSeq];
  const [result] = await pool.query(query, values);
  return result;
};

PostRepository.prototype.deletePost = async function (params) {
  const pool = database.pool;
  const query = `
    DELETE
    FROM 
      posts
    WHERE
      user_seq = ?
      AND post_seq = ?;
  `;

  const values = [params.userSeq, params.postSeq];
  const [result] = await pool.query(query, values);
  return result;
};

module.exports = PostRepository;
