import cors from 'cors';
import express, { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, '../../data');
const dbPath = path.join(dbDir, 'vault.db');

// Ensure data directory exists
import fs from 'fs';
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT,
    updated_at TEXT
  );

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
import { authenticateToken, AuthRequest } from './middleware/auth.js';

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'], // Frontend URLs
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication endpoints
app.post('/api/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?');
    const existingUser = checkStmt.get(email) as { id: string } | undefined;

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = nanoid();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const insertStmt = db.prepare('INSERT INTO users (id, email, password, created_at, updated_at) VALUES (?,?,?,?,?)');
    insertStmt.run(userId, email, hashedPassword, createdAt, updatedAt);

    // Generate JWT token
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, email, createdAt }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Alias for frontend compatibility
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?');
    const existingUser = checkStmt.get(email) as { id: string } | undefined;

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = nanoid();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const insertStmt = db.prepare('INSERT INTO users (id, email, password, created_at, updated_at) VALUES (?,?,?,?,?)');
    insertStmt.run(userId, email, hashedPassword, createdAt, updatedAt);

    // Generate JWT token
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, email, createdAt }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Alias for frontend compatibility
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const stmt = db.prepare('SELECT id, email, password FROM users WHERE email = ?');
    const user = stmt.get(email) as { id: string; email: string; password: string } | undefined;

    console.log('Login attempt for email:', email);
    console.log('Found user:', user ? { id: user.id, email: user.email } : null);

    if (!user || !user.id) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user info
app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({
    user: {
      id: req.user!.id,
      email: req.user!.email
    }
  });
});

app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const stmt = db.prepare('SELECT id, email, password FROM users WHERE email = ?');
    const user = stmt.get(email) as { id: string; email: string; password: string } | undefined;

    console.log('Login attempt for email:', email);
    console.log('Found user:', user ? { id: user.id, email: user.email } : null);

    if (!user || !user.id) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// simple ping
app.get('/api/ping', (_req: Request, res: Response) => res.json({ ok: true }));

// Protected routes - require authentication
// list keys
app.get('/api/keys', authenticateToken, (req: AuthRequest, res: Response) => {
    const stmt = db.prepare('SELECT id, name, environment, key, created_at, revoked FROM keys WHERE user_id = ? ORDER BY created_at DESC');
    const rows = stmt.all(req.user!.id);
    res.json(rows);
});

// create key
app.post('/api/keys', authenticateToken, (req: AuthRequest, res: Response) => {
    console.log('POST /api/keys req.body:', req.body);
    const { name = 'Unnamed', environment = 'development' } = req.body || {};
    const id = nanoid();
    // fake key
    const key = (environment === 'production' ? 'sk_prod_' : 'sk_dev_') + nanoid(8);
    const created_at = new Date().toISOString();
    const stmt = db.prepare('INSERT INTO keys (id, name, environment, key, created_at, revoked, user_id) VALUES (?,?,?,?,?,0,?)');
    stmt.run(id, name, environment, key, created_at, req.user!.id);
    res.status(201).json({ id, name, environment, key, created_at, revoked: 0 });
});

// revoke key
app.post('/api/keys/:id/revoke', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const stmt = db.prepare('UPDATE keys SET revoked=1 WHERE id = ? AND user_id = ?');
    const info = stmt.run(id, req.user!.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API listening on ${port}`));
