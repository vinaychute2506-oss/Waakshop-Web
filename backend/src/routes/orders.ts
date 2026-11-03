import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { customerAuth } from '../middleware/auth';

const router = Router();

// GET /store/orders/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1 OR display_id = $1', [req.params.id]);
    if (orderRes.rows.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const order = orderRes.rows[0];
    const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    const paymentsRes = await pool.query('SELECT id, provider_id, status, amount, created_at FROM payments WHERE order_id = $1', [order.id]);

    res.json({
      order: {
        ...order,
        items: itemsRes.rows,
        payments: paymentsRes.rows,
      },
    });
  } catch (error: any) {
    console.error('Order fetch error:', error);
    res.status(500).json({ error: 'Failed to retrieve order details' });
  }
});

// GET /store/customers/me/orders
router.get('/customer/history', customerAuth, async (req: Request, res: Response) => {
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
    res.status(500).json({ error: 'Failed to fetch customer orders' });
  }
});

// POST /store/orders/:id/cancel
router.post('/:id/cancel', customerAuth, async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const orderRes = await client.query(
      'SELECT * FROM orders WHERE id = $1 AND customer_id = $2',
      [req.params.id, req.customer!.id]
    );

    if (orderRes.rows.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const order = orderRes.rows[0];
    if (order.status === 'shipped' || order.status === 'delivered') {
      res.status(400).json({ error: 'Shipped orders cannot be cancelled online. Please contact the Atelier.' });
      return;
    }

    if (order.status === 'cancelled') {
      res.status(400).json({ error: 'Order is already cancelled' });
      return;
    }

    await client.query('BEGIN');

    // Restore stock if it was captured
    if (order.payment_status === 'captured') {
      const itemsRes = await client.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      for (const item of itemsRes.rows) {
        if (item.variant_id) {
          await client.query(
            'UPDATE product_variants SET stock_quantity = stock_quantity + $1 WHERE id = $2',
            [item.quantity, item.variant_id]
          );
        }
      }
    }

    await client.query(
      `UPDATE orders SET status = 'cancelled', payment_status = 'refunded', updated_at = NOW() WHERE id = $1`,
      [order.id]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Order cancelled and stock restored successfully' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Order cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  } finally {
    client.release();
  }
});

export default router;
