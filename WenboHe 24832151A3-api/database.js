const mysql = require("mysql2/promise");
const dbDetails = require("./db-details");

/** Creates a single MySQL connection for one-off database operations. */
function getConnection() {
  return mysql.createConnection(dbDetails);
}

/** Creates the shared MySQL pool used by API requests. */
function getPool() {
  return mysql.createPool({
    ...dbDetails,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
  });
}

module.exports = { getConnection, getPool };
