import db from './db/db.js';

console.log('=== DEBUG DATABASE ===');

// Check what tables exist
try {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables in database:', tables);
} catch (error) {
  console.log('Error checking tables:', error);
}

// Check if users table exists and what's in it
try {
  const users = db.prepare('SELECT id, email, created_at FROM users').all();
  console.log('Users:', users);
} catch (error) {
  console.log('Error checking users table:', error);
}

// Check if keys table exists and what's in it
try {
  const keys = db.prepare('SELECT id, name, environment, user_id FROM keys').all();
  console.log('Keys:', keys);
} catch (error) {
  console.log('Error checking keys table:', error);
}

// Test adding a user directly
try {
  const testEmail = `test-${Date.now()}@example.com`;
  console.log(`Testing user creation with email: ${testEmail}`);

  const insertStmt = db.prepare('INSERT INTO users (id, email, password, created_at, updated_at) VALUES (?,?,?,?,?)');
  insertStmt.run('test-id', testEmail, 'hashed-password', new Date().toISOString(), new Date().toISOString());

  console.log('User created successfully');

  // Verify user was created
  const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(testEmail);
  console.log('Retrieved user:', user);

} catch (error) {
  console.log('Error creating test user:', error);
}

db.close();
