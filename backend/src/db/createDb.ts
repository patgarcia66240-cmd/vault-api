import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data/vault.db');

// Ensure the data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create a new empty database
const SQLClass = await initSqlJs();
const db = new SQLClass.Database();

// Create tables
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT,
    updated_at TEXT
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS keys (
    id TEXT PRIMARY KEY,
    name TEXT,
    environment TEXT,
    key TEXT,
    created_at TEXT,
    revoked INTEGER DEFAULT 0,
    user_id TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

// Save the database
fs.writeFileSync(dbPath, db.export());

console.log('Database created successfully at:', dbPath);
console.log('Tables created: users, keys');