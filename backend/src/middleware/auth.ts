import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'waak_luxury_jwt_secret_key_2026_super_secure';

export interface AuthenticatedCustomer {
  id: string;
  email: string;
}

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      customer?: AuthenticatedCustomer;
      admin?: AuthenticatedAdmin;
    }
  }
}

export function customerAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role && decoded.role === 'admin') {
      res.status(403).json({ error: 'Customer credentials required' });
      return;
    }
    req.customer = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

export function optionalCustomerAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.customer = { id: decoded.id, email: decoded.email };
  } catch {
    // Ignore invalid optional tokens
  }
  next();
}

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Admin authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'admin') {
      res.status(403).json({ error: 'Admin privileges required' });
      return;
    }
    req.admin = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired admin token' });
  }
}
