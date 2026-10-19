require("dotenv").config();

/**
 * Reads database settings from the hosting environment.
 * Keeping credentials outside source code allows the same API to run in each
 * environment without changing the database module.
 */
module.exports = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "charityevents_db",
};
