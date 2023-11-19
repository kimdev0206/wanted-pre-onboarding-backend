module.exports = (database) => {
  return Object.freeze({
    insertPost,
    insertPostWithSeq,
    selectPostListCount,
    selectPostListPaging,
    selectSubPostSeqs,
    selectParentPostSeq,
    selectPost,
    selectLatestPost,
    updatePost,
    deletePost,
  });

  async function insertPost({ postTitle, postContent, userSeq }) {
    const pool = await database.get();
    const query = `
      INSERT INTO post
        (user_seq, post_title, post_content)
      VALUES
        (${userSeq}, '${postTitle}', '${postContent}');
    `;

    await pool.query(query);
  }

  async function insertPostWithSeq({
    postSeq,
    parentSeq,
    postTitle,
    postContent,
    userSeq,
  }) {
    const pool = await database.get();
    const query = `
      INSERT INTO post
        (post_seq, parent_seq, user_seq, post_title, post_content)
      VALUES
        (${postSeq}, ${parentSeq}, ${userSeq}, '${postTitle}', '${postContent}');
    `;

    await pool.query(query);
  }

  async function selectPostListCount() {
    const pool = await database.get();
    const query = `
      SELECT 
        COUNT(*) AS postListCount
      FROM post;
    `;

    const [result] = await pool.query(query);
    return result;
  }

  async function selectPostListPaging({ limit, offset }) {
    const pool = await database.get();
    const query = `
      SELECT 
        p.post_seq AS postSeq,
        p.post_title AS postTitle,
        u.user_email AS userEmail,
        p.created_at AS createdAt
      FROM user AS u      
      INNER JOIN post AS p
        ON u.user_seq = p.user_seq
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset};
    `;

    const [result] = await pool.query(query);
    return result;
  }

  async function selectSubPostSeqs(postSeq) {
    const pool = await database.get();
    const query = `
			SELECT
				post_seq AS postSeq
      FROM post
			WHERE
				parent_seq = ${postSeq};
		`;

    const [result] = await pool.query(query);
    return result;
  }

  async function selectParentPostSeq(postSeq) {
    const pool = await database.get();
    const query = `
      WITH RECURSIVE cte AS (
        SELECT
          post_seq,
          parent_seq
        FROM post
        WHERE post_seq = ${postSeq}
        UNION ALL
        SELECT
          p.post_seq,
          p.parent_seq
        FROM post AS p
        INNER JOIN cte AS c
          ON c.parent_seq = p.post_seq
      )
      SELECT
        post_seq AS postSeq
      FROM cte;
    `;

    const [result] = await pool.query(query);
    return result;
  }

  async function selectPost(postSeq) {
    const pool = await database.get();
    const query = `
      SELECT 	
        p.post_title AS postTitle,
        p.post_content AS postContent,
        u.user_email AS userEmail,
        u.user_seq AS userSeq,
        p.created_at AS createdAt,
        p.updated_at As updatedAt
      FROM user AS u      
      INNER JOIN post AS p
        ON u.user_seq = p.user_seq
      WHERE p.post_seq = ${postSeq};
    `;

    const [result] = await pool.query(query);
    return result;
  }

  async function selectLatestPost(userSeq) {
    const pool = await database.get();
    const query = `
      SELECT
        p.post_seq AS postSeq,
        u.user_email AS userEmail
      FROM user AS u
      INNER JOIN post AS p
        ON u.user_seq = p.user_seq
      WHERE u.user_seq = ${userSeq}
      ORDER BY p.created_at DESC
      LIMIT 1;
    `;

    const [result] = await pool.query(query);
    return result;
  }

  async function updatePost({ postSeq, userSeq, postTitle, postContent }) {
    const pool = await database.get();
    const query = `
      UPDATE post
      SET
        post_title = '${postTitle}',
        post_content = '${postContent}'
      WHERE user_seq = ${userSeq}
        AND post_seq = ${postSeq};
    `;

    const [result] = await pool.query(query);
    return result;
  }

  async function deletePost({ postSeq, userSeq }) {
    const pool = await database.get();
    const query = `
      DELETE 
      FROM post      
      WHERE user_seq = ${userSeq}
        AND post_seq = ${postSeq};
    `;

    const [result] = await pool.query(query);
    return result;
  }
};
