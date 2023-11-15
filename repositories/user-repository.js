module.exports = (database) => {
  return Object.freeze({
    insertUser,
    selectByUserEmail,
    deleteUser,
  });

  async function insertUser({ userEmail, hashedPassword }) {
    const pool = await database.get();
    const query = `
      INSERT INTO user
        (user_email, hashed_password)
      VALUES
        ('${userEmail}', '${hashedPassword}');
    `;

    const [result] = await pool.query(query);
    return result;
  }

  async function selectByUserEmail(userEmail) {
    const pool = await database.get();
    const query = `
      SELECT
        user_seq AS userSeq,
        user_email AS userEmail,
        hashed_password AS hashedPassword
      FROM user
      WHERE
        user_email = '${userEmail}';
    `;

    const [result] = await pool.query(query);
    return result;
  }

  async function deleteUser(userEmail) {
    const pool = await database.get();
    const query = `
      DELETE
      FROM user
      WHERE
        user_email = '${userEmail}';
    `;

    await pool.query(query);
  }
};
