// Simple in-memory storage for development
interface User {
  id: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
}

interface Key {
  id: string;
  name: string;
  environment: string;
  key: string;
  created_at: string;
  revoked: number;
  user_id: string;
}

// In-memory storage
const users: User[] = [
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

const keys: Key[] = [];

// Database interface
const simpleDb = {
  // Prepare statement interface
  prepare: (sql: string) => {
    return {
      get: (...params: any[]) => {
        if (sql.includes('SELECT') && sql.includes('users')) {
          if (sql.includes('WHERE email =')) {
            const email = params[0];
            return users.find(u => u.email === email) || null;
          }
          if (sql.includes('WHERE id =')) {
            const id = params[0];
            return users.find(u => u.id === id) || null;
          }
        }
        if (sql.includes('SELECT') && sql.includes('keys')) {
          if (sql.includes('WHERE user_id =')) {
            const userId = params[0];
            return keys.filter(k => k.user_id === userId && k.revoked === 0);
          }
          if (sql.includes('WHERE id =') && sql.includes('user_id =')) {
            const id = params[0];
            const userId = params[1];
            return keys.find(k => k.id === id && k.user_id === userId) || null;
          }
        }
        return null;
      },
      all: (...params: any[]) => {
        if (sql.includes('SELECT') && sql.includes('users')) {
          return users.map(u => ({ id: u.id, email: u.email, created_at: u.created_at }));
        }
        if (sql.includes('SELECT') && sql.includes('keys')) {
          if (sql.includes('WHERE user_id =')) {
            const userId = params[0];
            return keys.filter(k => k.user_id === userId && k.revoked === 0);
          }
        }
        return [];
      },
      run: (...params: any[]) => {
        if (sql.includes('INSERT INTO users')) {
          const [id, email, password, created_at, updated_at] = params;
          const existingUser = users.find(u => u.email === email);
          if (!existingUser) {
            users.push({ id, email, password, created_at, updated_at });
          }
        }
        if (sql.includes('INSERT INTO keys')) {
          const [id, name, environment, key, created_at, revoked, user_id] = params;
          keys.push({ id, name, environment, key, created_at, revoked, user_id });
        }
        if (sql.includes('UPDATE keys SET revoked=1')) {
          const [id, user_id] = params;
          const keyToUpdate = keys.find(k => k.id === id && k.user_id === user_id);
          if (keyToUpdate) {
            keyToUpdate.revoked = 1;
          }
        }
        return { changes: 1 };
      }
    };
  },

  // Direct query methods
  run: (sql: string) => {
    console.log('Running SQL:', sql);
  }
};

export default simpleDb;