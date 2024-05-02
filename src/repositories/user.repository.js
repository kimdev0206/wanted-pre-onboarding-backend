const database = require("../database");

function UserRepository() {}

UserRepository.prototype.insertUser = async function (params) {
  const pool = database.pool;
  const query = `
    INSERT INTO
      users
      (
        email,
        hashed_password
      )
    VALUES
      (?, ?);
  `;

  const values = [params.email, params.hashedPassword];
  const [result] = await pool.query(query, values);
  return result;
};

UserRepository.prototype.selectUser = async function (email) {
  const pool = database.pool;
  const query = `
    SELECT
      user_seq AS userSeq,
      email,
      hashed_password AS hashedPassword
    FROM 
      users
    WHERE
      email = ?;
  `;

  const values = [email];
  const [result] = await pool.query(query, values);
  return result;
};

UserRepository.prototype.deleteUser = async function (email) {
  const pool = database.pool;
  const query = `
    DELETE
    FROM 
      users
    WHERE
      email = ?;
  `;

  const values = [email];
  await pool.query(query, values);
};

module.exports = UserRepository;
