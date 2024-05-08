const mysql = require("mysql2/promise");

function Database() {
  poolOptions = {
    host: "localhost",
    user: "root",
    password: "root",
    database: "breadcrumbs_closure",
  };
  pool = mysql.createPool(poolOptions);

  return {
    pool,
    connect,
  };

  function connect() {
    pool.query("SELECT 1").then(() => console.log("Connected on 3306 (MySQL)"));
  }
}

module.exports = new Database();
