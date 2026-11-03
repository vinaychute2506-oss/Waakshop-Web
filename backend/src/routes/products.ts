import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// GET /store/products
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, occasion, sort } = req.query;

    let query = `
      SELECT p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', v.id,
              'sku', v.sku,
              'title', v.title,
              'size', v.size,
              'stock_quantity', v.stock_quantity,
              'reserved_quantity', v.reserved_quantity,
              'price', COALESCE(v.price, p.price)
            ) ORDER BY v.size ASC
          ) FILTER (WHERE v.id IS NOT NULL), '[]'
        ) as variants
      FROM products p
      LEFT JOIN product_variants v ON v.product_id = p.id
    `;

    const whereClauses: string[] = [];
    const values: any[] = [];

    if (category && category !== 'All') {
      values.push(category);
      whereClauses.push(`p.category = $${values.length}`);
    }

    if (occasion && occasion !== 'All') {
      values.push(occasion);
      whereClauses.push(`p.occasion = $${values.length}`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    query += ' GROUP BY p.id';

    if (sort === 'price-asc') {
      query += ' ORDER BY p.price ASC';
    } else if (sort === 'price-desc') {
      query += ' ORDER BY p.price DESC';
    } else {
      query += ' ORDER BY p.created_at ASC';
    }

    const result = await pool.query(query, values);
    res.json({ products: result.rows, count: result.rows.length });
  } catch (error: any) {
    console.error('Products fetch error:', error);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// GET /store/products/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', v.id,
              'sku', v.sku,
              'title', v.title,
              'size', v.size,
              'stock_quantity', v.stock_quantity,
              'reserved_quantity', v.reserved_quantity,
              'price', COALESCE(v.price, p.price)
            ) ORDER BY v.size ASC
          ) FILTER (WHERE v.id IS NOT NULL), '[]'
        ) as variants
      FROM products p
      LEFT JOIN product_variants v ON v.product_id = p.id
      WHERE p.id = $1
      GROUP BY p.id
    `;

    const result = await pool.query(query, [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ product: result.rows[0] });
  } catch (error: any) {
    console.error('Product detail fetch error:', error);
    res.status(500).json({ error: 'Failed to retrieve product details' });
  }
});

export default router;
