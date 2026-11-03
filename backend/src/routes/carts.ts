import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { optionalCustomerAuth } from '../middleware/auth';

const router = Router();

async function getPopulatedCart(cartId: string) {
  const cartRes = await pool.query('SELECT * FROM carts WHERE id = $1', [cartId]);
  if (cartRes.rows.length === 0) return null;
  const cart = cartRes.rows[0];

  const itemsRes = await pool.query(
    `SELECT
       ci.id,
       ci.cart_id,
       ci.variant_id,
       ci.product_id,
       ci.quantity,
       ci.unit_price,
       (ci.quantity * ci.unit_price) as item_total,
       p.title,
       p.thumbnail,
       v.size,
       v.sku,
       v.stock_quantity
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     JOIN product_variants v ON v.id = ci.variant_id
     WHERE ci.cart_id = $1
     ORDER BY ci.created_at ASC`,
    [cartId]
  );

  const items = itemsRes.rows.map((row) => ({
    id: row.id,
    variant_id: row.variant_id,
    product_id: row.product_id,
    title: row.title,
    size: row.size,
    sku: row.sku,
    quantity: parseInt(row.quantity, 10),
    unit_price: parseInt(row.unit_price, 10),
    total: parseInt(row.item_total, 10),
    thumbnail: row.thumbnail,
    stock_quantity: parseInt(row.stock_quantity, 10),
  }));

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const shipping_total = 0; // Complimentary atelier express delivery
  const tax_total = Math.round(subtotal * 0.12); // 12% GST applicable on luxury apparel
  const total = subtotal; // Inclusive pricing or standard checkout total

  return {
    ...cart,
    items,
    item_count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    tax_total,
    shipping_total,
    total,
  };
}

// POST /store/carts
router.post('/', optionalCustomerAuth, async (req: Request, res: Response) => {
  try {
    const customerId = req.customer?.id || null;
    const guestToken = req.body.guest_token || `guest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const cartId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await pool.query(
      `INSERT INTO carts (id, customer_id, guest_token, currency_code)
       VALUES ($1, $2, $3, 'INR')`,
      [cartId, customerId, guestToken]
    );

    const cart = await getPopulatedCart(cartId);
    res.status(201).json({ cart });
  } catch (error: any) {
    console.error('Cart creation error:', error);
    res.status(500).json({ error: 'Failed to create cart' });
  }
});

// GET /store/carts/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const cartId = String(req.params.id);
    const cart = await getPopulatedCart(cartId);
    if (!cart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }
    res.json({ cart });
  } catch (error: any) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ error: 'Failed to retrieve cart' });
  }
});

// POST /store/carts/:id/line-items
router.post('/:id/line-items', async (req: Request, res: Response) => {
  try {
    const cartId = String(req.params.id);
    const { product_id, size, quantity = 1 } = req.body;

    if (!product_id || !size) {
      res.status(400).json({ error: 'product_id and size are required' });
      return;
    }

    // Verify product and variant
    const variantRes = await pool.query(
      `SELECT v.*, p.price as product_price
       FROM product_variants v
       JOIN products p ON p.id = v.product_id
       WHERE v.product_id = $1 AND v.size = $2`,
      [product_id, size.toString()]
    );

    if (variantRes.rows.length === 0) {
      res.status(404).json({ error: `Variant for size ${size} not found` });
      return;
    }

    const variant = variantRes.rows[0];
    const unitPrice = variant.price || variant.product_price;

    // Check stock
    const existingItemRes = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND variant_id = $2',
      [cartId, variant.id]
    );

    const currentQty = existingItemRes.rows.length > 0 ? existingItemRes.rows[0].quantity : 0;
    const requestedTotal = currentQty + parseInt(quantity, 10);

    if (requestedTotal > variant.stock_quantity) {
      res.status(400).json({
        error: `Only ${variant.stock_quantity} pieces available in size ${size}`,
        available_stock: variant.stock_quantity,
      });
      return;
    }

    if (existingItemRes.rows.length > 0) {
      await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2',
        [requestedTotal, existingItemRes.rows[0].id]
      );
    } else {
      const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await pool.query(
        `INSERT INTO cart_items (id, cart_id, variant_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [itemId, cartId, variant.id, product_id, quantity, unitPrice]
      );
    }

    await pool.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cartId]);
    const cart = await getPopulatedCart(cartId);
    res.json({ cart });
  } catch (error: any) {
    console.error('Add line item error:', error);
    res.status(500).json({ error: 'Failed to add item to bag' });
  }
});

// POST /store/carts/:id/line-items/:line_id
router.post('/:id/line-items/:line_id', async (req: Request, res: Response) => {
  try {
    const cartId = String(req.params.id);
    const lineId = String(req.params.line_id);
    const { quantity } = req.body;
    const newQty = parseInt(quantity, 10);

    if (isNaN(newQty) || newQty <= 0) {
      await pool.query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [lineId, cartId]);
    } else {
      // Check stock
      const itemRes = await pool.query(
        `SELECT ci.*, v.stock_quantity, v.size
         FROM cart_items ci
         JOIN product_variants v ON v.id = ci.variant_id
         WHERE ci.id = $1 AND ci.cart_id = $2`,
        [lineId, cartId]
      );

      if (itemRes.rows.length === 0) {
        res.status(404).json({ error: 'Cart item not found' });
        return;
      }

      const item = itemRes.rows[0];
      if (newQty > item.stock_quantity) {
        res.status(400).json({
          error: `Only ${item.stock_quantity} pieces available in size ${item.size}`,
          available_stock: item.stock_quantity,
        });
        return;
      }

      await pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [newQty, lineId]);
    }

    await pool.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cartId]);
    const cart = await getPopulatedCart(cartId);
    res.json({ cart });
  } catch (error: any) {
    console.error('Update line item error:', error);
    res.status(500).json({ error: 'Failed to update item quantity' });
  }
});

// DELETE /store/carts/:id/line-items/:line_id
router.delete('/:id/line-items/:line_id', async (req: Request, res: Response) => {
  try {
    const cartId = String(req.params.id);
    const lineId = String(req.params.line_id);
    await pool.query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [lineId, cartId]);
    await pool.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cartId]);

    const cart = await getPopulatedCart(cartId);
    res.json({ cart });
  } catch (error: any) {
    console.error('Remove line item error:', error);
    res.status(500).json({ error: 'Failed to remove item from bag' });
  }
});

// POST /store/carts/:id/customer
router.post('/:id/customer', optionalCustomerAuth, async (req: Request, res: Response) => {
  try {
    const cartId = String(req.params.id);
    const { customer_id } = req.body;
    const activeCustomerId = req.customer?.id || customer_id;

    if (!activeCustomerId) {
      res.status(400).json({ error: 'Customer ID required' });
      return;
    }

    await pool.query('UPDATE carts SET customer_id = $1, updated_at = NOW() WHERE id = $2', [
      activeCustomerId,
      cartId,
    ]);

    const cart = await getPopulatedCart(cartId);
    res.json({ cart });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to attach customer to cart' });
  }
});

export default router;
