import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { adminAuth } from '../middleware/auth';

import { config } from '../config';

const router = Router();
const JWT_SECRET = config.jwtSecret;

import { loginRateLimiter, resetRateLimits } from '../middleware/rateLimiter';

// POST /admin/rate-limits/reset
router.post('/rate-limits/reset', (_req: Request, res: Response) => {
  resetRateLimits();
  res.json({ success: true, message: 'Rate limits cleared' });
});

// POST /admin/auth/token
router.post('/auth/token', loginRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    // Production credential hardening guard
    if (config.admin.defaultPasswordBlocked && password === 'waakAdmin2026!') {
      res.status(403).json({
        error: 'Default development credentials prohibited in production/staging mode. Set ADMIN_PASSWORD in environment.',
      });
      return;
    }

    const result = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid admin credentials' });
      return;
    }

    const admin = result.rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      res.status(401).json({ error: 'Invalid admin credentials' });
      return;
    }

    const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed' });
  }
});

// GET /admin/stats
router.get('/stats', adminAuth, async (_req: Request, res: Response) => {
  try {
    const revenueRes = await pool.query(
      "SELECT COALESCE(SUM(total), 0) as total_revenue, COUNT(*) as total_orders FROM orders WHERE status = 'paid' OR status = 'processing' OR status = 'shipped' OR status = 'delivered'"
    );

    const customerRes = await pool.query('SELECT COUNT(*) as total_customers FROM customers');

    const lowStockRes = await pool.query(
      `SELECT p.title, v.size, v.stock_quantity, v.sku
       FROM product_variants v
       JOIN products p ON p.id = v.product_id
       WHERE v.stock_quantity <= 4
       ORDER BY v.stock_quantity ASC`
    );

    res.json({
      total_revenue: parseInt(revenueRes.rows[0].total_revenue, 10),
      total_orders: parseInt(revenueRes.rows[0].total_orders, 10),
      total_customers: parseInt(customerRes.rows[0].total_customers, 10),
      low_stock_items: lowStockRes.rows,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// GET /admin/orders
router.get('/orders', adminAuth, async (_req: Request, res: Response) => {
  try {
    const ordersRes = await pool.query(
      `SELECT o.*,
         COALESCE(
           json_agg(
             json_build_object(
               'id', oi.id,
               'title', oi.title,
               'size', oi.size,
               'quantity', oi.quantity,
               'unit_price', oi.unit_price,
               'total', oi.total,
               'thumbnail', oi.thumbnail
             )
           ) FILTER (WHERE oi.id IS NOT NULL), '[]'
         ) as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );

    res.json({ orders: ordersRes.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PUT /admin/orders/:id/status
router.put('/orders/:id/status', adminAuth, async (req: Request, res: Response) => {
  try {
    const { status, fulfillment_status } = req.body;
    const result = await pool.query(
      `UPDATE orders
       SET status = COALESCE($1, status),
           fulfillment_status = COALESCE($2, fulfillment_status),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, fulfillment_status, req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ order: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// GET /admin/products
router.get('/products', adminAuth, async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', v.id,
              'sku', v.sku,
              'size', v.size,
              'stock_quantity', v.stock_quantity,
              'reserved_quantity', v.reserved_quantity,
              'price', COALESCE(v.price, p.price)
            ) ORDER BY v.size ASC
          ) FILTER (WHERE v.id IS NOT NULL), '[]'
        ) as variants
      FROM products p
      LEFT JOIN product_variants v ON v.product_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at ASC
    `;
    const result = await pool.query(query);
    res.json({ products: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// PUT /admin/products/:id/stock
router.put('/products/:id/stock', adminAuth, async (req: Request, res: Response) => {
  try {
    const { variant_id, stock_quantity } = req.body;
    if (!variant_id || stock_quantity === undefined) {
      res.status(400).json({ error: 'variant_id and stock_quantity required' });
      return;
    }

    await pool.query(
      'UPDATE product_variants SET stock_quantity = $1 WHERE id = $2 AND product_id = $3',
      [parseInt(stock_quantity, 10), variant_id, req.params.id]
    );

    res.json({ success: true, variant_id, stock_quantity });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// GET /admin/customers
router.get('/customers', adminAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.email, c.first_name, c.last_name, c.phone, c.created_at,
         COUNT(DISTINCT o.id) as order_count,
         COALESCE(SUM(o.total), 0) as lifetime_spend
       FROM customers c
       LEFT JOIN orders o ON o.customer_id = c.id
       GROUP BY c.id
       ORDER BY c.created_at DESC`
    );

    res.json({ customers: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

export default router;
