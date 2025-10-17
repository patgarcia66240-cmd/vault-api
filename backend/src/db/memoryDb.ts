import initSqlJs from 'sql.js';

// Create in-memory database for development
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

// Override the prepare method to match the expected interface
const originalPrepare = db.prepare.bind(db);
db.prepare = (sql: string) => {
  const stmt = originalPrepare(sql);
  const originalRun = stmt.run;
  (stmt as any).run = (...args: any[]) => {
    if (args.length > 0) stmt.bind(args);
    originalRun.call(stmt);
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
  return stmt;
};

// Add some test users for development
const testUsers = [
  {
    id: 'test-user-1',
    email: 'admin@example.com',
    password: '$2b$10$GOL2w/iatdQ9oAbd9L20ietlJJA54uUjqAaCTWb2pFdfVUfs49JYO', // password123
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'test-user-2',
    email: 'user@example.com',
    password: '$2b$10$GOL2w/iatdQ9oAbd9L20ietlJJA54uUjqAaCTWb2pFdfVUfs49JYO', // password123
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

testUsers.forEach(user => {
  try {
    const stmt = db.prepare('INSERT OR IGNORE INTO users (id, email, password, created_at, updated_at) VALUES (?,?,?,?,?)');
    stmt.run([user.id, user.email, user.password, user.created_at, user.updated_at]);
  } catch (error) {
    console.log('Test user already exists:', user.email);
  }
});

export default db as any;
