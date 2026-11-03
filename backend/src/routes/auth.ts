import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { customerAuth } from '../middleware/auth';
import { loginRateLimiter, registerRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'waak_luxury_jwt_secret_key_2026_super_secure';

// POST /auth/customer/register
router.post('/customer/register', registerRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, first_name = '', last_name = '', phone = '' } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const existing = await pool.query('SELECT id FROM customers WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customerId = `cus_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const result = await pool.query(
      `INSERT INTO customers (id, email, password_hash, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, phone, created_at`,
      [customerId, email.toLowerCase().trim(), passwordHash, first_name, last_name, phone]
    );

    const customer = result.rows[0];
    const token = jwt.sign({ id: customer.id, email: customer.email }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        created_at: customer.created_at,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /auth/customer/login
router.post('/customer/login', loginRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await pool.query(
      'SELECT id, email, password_hash, first_name, last_name, phone, created_at FROM customers WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const customer = result.rows[0];
    const match = await bcrypt.compare(password, customer.password_hash);
    if (!match) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ id: customer.id, email: customer.email }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        created_at: customer.created_at,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// GET /auth/customer/me
router.get('/customer/me', customerAuth, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, phone, created_at FROM customers WHERE id = $1',
      [req.customer!.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const addresses = await pool.query(
      'SELECT * FROM customer_addresses WHERE customer_id = $1 ORDER BY is_default DESC, created_at DESC',
      [req.customer!.id]
    );

    res.json({
      customer: {
        ...result.rows[0],
        addresses: addresses.rows,
      },
    });
  } catch (error: any) {
    console.error('Fetch customer me error:', error);
    res.status(500).json({ error: 'Failed to retrieve customer data' });
  }
});

// POST /auth/customer/logout
router.post('/customer/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
