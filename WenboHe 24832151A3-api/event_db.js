const { getPool } = require("./database");

const pool = getPool();

/** Pings the database without running a data-changing query. */
async function checkConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

module.exports = { pool, checkConnection };
