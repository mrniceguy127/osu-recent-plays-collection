// Matt Kleiner
// 03/11/2020
// SQL connection initialization

const mysql = require('mysql');

const SQL_HOST = process.env.SQL_HOST;
const SQL_USER = process.env.SQL_USER;
const SQL_PASSWORD = process.env.SQL_PASSWORD
const SQL_DB = process.env.SQL_CB

function init_server() {
  let connection = mysql.createConnection({
    host: SQL_HOST,
    user: SQL_USER,
    password: SQL_PASSWORD,
    database: SQL_DB
  });

  return connection;
}

module.exports = init_server;
