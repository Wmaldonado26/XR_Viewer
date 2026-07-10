const path = require("path");
const dotenv = require("dotenv");

const backendRoot = path.resolve(__dirname, "..", "..");
const projectRoot = path.resolve(backendRoot, "..");

dotenv.config({ path: path.join(projectRoot, ".env") });
dotenv.config({ path: path.join(backendRoot, ".env"), override: true });

const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || "0.0.0.0";
const JWT_SECRET = process.env.JWT_SECRET || "cotecmar-dev-secret";
const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";
const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((value) => value.trim()).filter(Boolean)
  : true;

const UPLOADS_DIR = path.join(backendRoot, "uploads");
const DATABASE_FILE = path.join(backendRoot, "cotecmar.db");

function normalizeSqliteUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (!url.startsWith("file:")) return url;

  const filePath = url.slice("file:".length);
  if (filePath.startsWith("./") || filePath.startsWith("../")) {
    const abs = path.resolve(backendRoot, filePath);
    return `file:${abs.replace(/\\/g, "/")}`;
  }

  return url;
}

const DATABASE_URL = process.env.DATABASE_URL
  ? normalizeSqliteUrl(process.env.DATABASE_URL)
  : `file:${DATABASE_FILE.replace(/\\/g, "/")}`;

const DEFAULT_ADMIN = {
  name: process.env.DEFAULT_ADMIN_NAME || "Administrador Principal",
  email: String(process.env.DEFAULT_ADMIN_EMAIL || "admin@cotecmar.local")
    .trim()
    .toLowerCase(),
  password: process.env.DEFAULT_ADMIN_PASSWORD || "admin123",
  phone: process.env.DEFAULT_ADMIN_PHONE || "",
};

process.env.DATABASE_URL = DATABASE_URL;

module.exports = {
  PORT,
  HOST,
  JWT_SECRET,
  TOKEN_EXPIRES_IN,
  CORS_ORIGIN,
  UPLOADS_DIR,
  DATABASE_FILE,
  DATABASE_URL,
  DEFAULT_ADMIN,
};
