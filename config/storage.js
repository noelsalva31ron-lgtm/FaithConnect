const path = require("path");

const DATA_ROOT = process.env.FAITHCONNECT_DATA_DIR
  ? path.resolve(process.env.FAITHCONNECT_DATA_DIR)
  : path.join(__dirname, "..");

const DATABASE_DIR = path.join(DATA_ROOT, "database");
const UPLOADS_DIR = path.join(DATA_ROOT, "uploads");

module.exports = {
  DATA_ROOT,
  DATABASE_DIR,
  UPLOADS_DIR
};
