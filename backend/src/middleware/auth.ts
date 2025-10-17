import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db/simpleDb.js';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Verify user exists in database
    const stmt = db.prepare('SELECT id, email FROM users WHERE id = ?');
    const user = stmt.get(decoded.userId) as { id: string; email: string } | null;

    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    req.user = { id: user.id, email: user.email };
    next();
  });
};

export { AuthRequest };
