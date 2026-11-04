import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { customerAuth } from '../middleware/auth';

const router = Router();

// GET /store/customers/me
router.get('/me', customerAuth, async (req: Request, res: Response) => {
  try {
    const custRes = await pool.query(
      'SELECT id, email, first_name, last_name, phone, created_at FROM customers WHERE id = $1',
      [req.customer!.id]
    );

    if (custRes.rows.length === 0) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const addrRes = await pool.query(
      'SELECT * FROM customer_addresses WHERE customer_id = $1 ORDER BY is_default DESC, created_at DESC',
      [req.customer!.id]
    );

    res.json({
      customer: {
        ...custRes.rows[0],
        addresses: addrRes.rows,
      },
    });
  } catch (error: any) {
    console.error('Customer profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch customer profile' });
  }
});

// GET /store/customers/me/orders (Alias for /store/orders/customer/history)
router.get('/me/orders', customerAuth, async (req: Request, res: Response) => {
  try {
    const ordersRes = await pool.query(
      `SELECT o.*,
         COALESCE(
           json_agg(
             json_build_object(
               'id', oi.id,
               'title', oi.title,
               'size', oi.size,
               'thumbnail', oi.thumbnail,
               'quantity', oi.quantity,
               'unit_price', oi.unit_price,
               'total', oi.total
             )
           ) FILTER (WHERE oi.id IS NOT NULL), '[]'
         ) as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.customer_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.customer!.id]
    );

    res.json({ orders: ordersRes.rows });
  } catch (error: any) {
    console.error('Customer orders fetch error:', error);
    res.status(500).json({ error: 'Failed to retrieve customer orders' });
  }
});

// PUT /store/customers/me
router.put('/me', customerAuth, async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, phone } = req.body;
    const result = await pool.query(
      `UPDATE customers
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, first_name, last_name, phone, created_at`,
      [first_name, last_name, phone, req.customer!.id]
    );

    res.json({ customer: result.rows[0] });
  } catch (error: any) {
    console.error('Customer profile update error:', error);
    res.status(500).json({ error: 'Failed to update customer profile' });
  }
});

// GET /store/customers/me/addresses
router.get('/me/addresses', customerAuth, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM customer_addresses WHERE customer_id = $1 ORDER BY is_default DESC, created_at DESC',
      [req.customer!.id]
    );
    res.json({ addresses: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// POST /store/customers/me/addresses
router.post('/me/addresses', customerAuth, async (req: Request, res: Response) => {
  try {
    const {
      first_name = '',
      last_name = '',
      address_1,
      address_2 = '',
      city,
      state,
      postal_code,
      country_code = 'IN',
      phone = '',
      is_default = false,
    } = req.body;

    if (!address_1 || !city || !state || !postal_code) {
      res.status(400).json({ error: 'address_1, city, state, and postal_code are required' });
      return;
    }

    const cleanPin = String(postal_code || '').trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      res.status(400).json({ error: 'Invalid postal code format: Exactly 6 numeric digits required for Indian PIN code delivery (e.g. 110001).' });
      return;
    }

    if (is_default) {
      await pool.query('UPDATE customer_addresses SET is_default = false WHERE customer_id = $1', [req.customer!.id]);
    }

    const addressId = `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const result = await pool.query(
      `INSERT INTO customer_addresses (id, customer_id, first_name, last_name, address_1, address_2, city, state, postal_code, country_code, phone, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [addressId, req.customer!.id, first_name, last_name, address_1, address_2, city, state, postal_code, country_code, phone, is_default]
    );

    res.status(201).json({ address: result.rows[0] });
  } catch (error: any) {
    console.error('Address creation error:', error);
    res.status(500).json({ error: 'Failed to create address' });
  }
});

// DELETE /store/customers/me/addresses/:id
router.delete('/me/addresses/:id', customerAuth, async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM customer_addresses WHERE id = $1 AND customer_id = $2', [req.params.id, req.customer!.id]);
    res.json({ success: true, id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

export default router;
