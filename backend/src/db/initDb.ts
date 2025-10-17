import db from './db.js';

const createUsers = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT,
  updated_at TEXT
);
`;

const createKeys = `
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
`;

db.run(createUsers);
db.run(createKeys);

console.log('Database initialized with users and keys tables');
