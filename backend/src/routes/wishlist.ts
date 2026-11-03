import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { customerAuth } from '../middleware/auth';

const router = Router();

// GET /store/wishlist
router.get('/', customerAuth, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT p.*, w.created_at as wishlisted_at
       FROM wishlists w
       JOIN products p ON p.id = w.product_id
       WHERE w.customer_id = $1
       ORDER BY w.created_at DESC`,
      [req.customer!.id]
    );

    res.json({ wishlist: result.rows });
  } catch (error: any) {
    console.error('Wishlist fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// POST /store/wishlist
router.post('/', customerAuth, async (req: Request, res: Response) => {
  try {
    const { product_id } = req.body;
    if (!product_id) {
      res.status(400).json({ error: 'product_id is required' });
      return;
    }

    const id = `wish_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await pool.query(
      `INSERT INTO wishlists (id, customer_id, product_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (customer_id, product_id) DO NOTHING`,
      [id, req.customer!.id, product_id]
    );

    res.status(201).json({ success: true, product_id });
  } catch (error: any) {
    console.error('Wishlist add error:', error);
    res.status(500).json({ error: 'Failed to add item to wishlist' });
  }
});

// DELETE /store/wishlist/:productId
router.delete('/:productId', customerAuth, async (req: Request, res: Response) => {
  try {
    await pool.query(
      'DELETE FROM wishlists WHERE customer_id = $1 AND product_id = $2',
      [req.customer!.id, req.params.productId]
    );
    res.json({ success: true, product_id: req.params.productId });
  } catch (error: any) {
    console.error('Wishlist delete error:', error);
    res.status(500).json({ error: 'Failed to remove item from wishlist' });
  }
});

export default router;
