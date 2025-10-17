import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data/vault.db');

let filebuffer: Uint8Array;
try {
  filebuffer = fs.readFileSync(dbPath);
} catch {
  filebuffer = new Uint8Array([]);
}

// Ensure the data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const SQLClass = await initSqlJs();
const db = new SQLClass.Database(filebuffer);

// Initialize schema if database is empty
if (filebuffer.length === 0) {
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
}

const originalPrepare = db.prepare.bind(db);
db.prepare = (sql: string) => {
  const stmt = originalPrepare(sql);
  const originalRun = stmt.run;
  (stmt as any).run = (...args: any[]) => {
    if (args.length > 0) stmt.bind(args);
    originalRun.call(stmt);
    save();
    return { changes: db.getRowsModified() };
  };
  (stmt as any).all = () => {
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.reset();
    return rows;
  };
  (stmt as any).get = (...args: any[]) => {
    if (args.length > 0) {
      stmt.bind(args);
    }
    if (stmt.step()) {
      const result = stmt.getAsObject();
      stmt.reset();
      return result;
    }
    stmt.reset();
    return null;
  };
  return stmt;
};

const save = () => {
  fs.writeFileSync(dbPath, db.export());
};

export default db as any;
