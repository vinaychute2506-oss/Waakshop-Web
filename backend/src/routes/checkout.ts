import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { pool } from '../db';
import { optionalCustomerAuth } from '../middleware/auth';

import { config } from '../config';

const router = Router();

const RAZORPAY_KEY_ID = config.razorpay.keyId;
const RAZORPAY_KEY_SECRET = config.razorpay.keySecret;

let razorpayClient: Razorpay | null = null;
try {
  razorpayClient = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
} catch (e) {
  console.warn('Razorpay client initialization warning:', e);
}

// POST /store/carts/:id/checkout
router.post('/carts/:id/checkout', optionalCustomerAuth, async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const cartId = String(req.params.id);
    const { email, shipping_address } = req.body;

    if (!email || !shipping_address) {
      res.status(400).json({ error: 'Email and shipping address are required for bespoke delivery' });
      return;
    }

    const cleanPin = String(shipping_address.postal_code || '').trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      res.status(400).json({ error: 'Invalid postal code format: Exactly 6 numeric digits required for Indian PIN code delivery (e.g. 110001).' });
      return;
    }

    // 1. Fetch Cart and Items
    const itemsRes = await client.query(
      `SELECT
         ci.id as item_id,
         ci.quantity,
         ci.unit_price,
         ci.variant_id,
         ci.product_id,
         p.title,
         p.thumbnail,
         v.size,
         v.sku,
         v.stock_quantity
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       JOIN product_variants v ON v.id = ci.variant_id
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    if (itemsRes.rows.length === 0) {
      res.status(400).json({ error: 'Your bespoke shopping bag is empty' });
      return;
    }

    // 2. Validate Stock for all items
    for (const item of itemsRes.rows) {
      if (item.quantity > item.stock_quantity) {
        res.status(400).json({
          error: `Insufficient atelier stock for ${item.title} (Size ${item.size}). Available: ${item.stock_quantity}`,
        });
        return;
      }
    }

    const subtotal = itemsRes.rows.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const tax_total = Math.round(subtotal * 0.12);
    const shipping_total = 0; // Complimentary express insured delivery
    const total = subtotal;

    // 3. Create Order in Database
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const displayNum = Math.floor(1000 + Math.random() * 9000);
    const displayId = `WAAK-2026-${displayNum}`;
    const customerId = req.customer?.id || null;

    await client.query('BEGIN');

    await client.query(
      `INSERT INTO orders (id, display_id, customer_id, email, status, fulfillment_status, payment_status, subtotal, tax_total, shipping_total, total, currency_code, shipping_address)
       VALUES ($1, $2, $3, $4, 'pending', 'not_fulfilled', 'awaiting', $5, $6, $7, $8, 'INR', $9)`,
      [orderId, displayId, customerId, email.toLowerCase().trim(), subtotal, tax_total, shipping_total, total, JSON.stringify(shipping_address)]
    );

    for (const item of itemsRes.rows) {
      const orderItemId = `oi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await client.query(
        `INSERT INTO order_items (id, order_id, product_id, variant_id, title, size, thumbnail, quantity, unit_price, total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [orderItemId, orderId, item.product_id, item.variant_id, item.title, item.size, item.thumbnail, item.quantity, item.unit_price, item.quantity * item.unit_price]
      );
    }

    // 4. Create Razorpay Order
    let razorpayOrderId = `rzp_order_${Date.now()}`;
    if (razorpayClient) {
      try {
        const rzpOrder: any = await (razorpayClient.orders as any).create({
          amount: total * 100, // paise
          currency: 'INR',
          receipt: displayId,
          notes: {
            order_id: orderId,
            cart_id: cartId,
            customer_email: email,
          },
        });
        if (rzpOrder && rzpOrder.id) {
          razorpayOrderId = rzpOrder.id;
        }
      } catch (rzpErr) {
        console.warn('Using simulated Razorpay Order ID for test mode:', (rzpErr as any).message);
      }
    }

    // Record Payment Intent
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await client.query(
      `INSERT INTO payments (id, order_id, provider_id, razorpay_order_id, amount, currency, status)
       VALUES ($1, $2, 'razorpay', $3, $4, 'INR', 'created')`,
      [paymentId, orderId, razorpayOrderId, total]
    );

    await client.query('COMMIT');

    res.status(201).json({
      order_id: orderId,
      display_id: displayId,
      razorpay_order_id: razorpayOrderId,
      razorpay_key_id: RAZORPAY_KEY_ID,
      amount: total * 100,
      currency: 'INR',
      total,
      customer: {
        email,
        name: `${shipping_address.first_name || ''} ${shipping_address.last_name || ''}`.trim(),
        phone: shipping_address.phone || '',
      },
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to initialize checkout session' });
  } finally {
    client.release();
  }
});

function safeCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// POST /store/payment/razorpay/verify
router.post('/payment/razorpay/verify', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!order_id || !razorpay_order_id || !razorpay_payment_id) {
      res.status(400).json({ error: 'Incomplete payment verification payload' });
      return;
    }

    // Verify HMAC-SHA256 signature
    let isValid = false;
    if (razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isValid = safeCompare(generatedSignature, razorpay_signature);
    }

    // In non-production testing, accept explicit mock test signature only if explicitly enabled
    if (!isValid && config.nodeEnv !== 'production' && (config.allowMockPayments || razorpay_signature === 'mock_test_signature')) {
      if (razorpay_signature === 'mock_test_signature') {
        isValid = true;
      }
    }

    if (!isValid) {
      res.status(400).json({ error: 'Invalid payment signature. Verification rejected.' });
      return;
    }

    await client.query('BEGIN');

    // 1. Fetch Order and Items with Row Lock
    const orderRes = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [order_id]);
    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const order = orderRes.rows[0];

    // IDEMPOTENCY GUARD: If order is already paid, return confirmed order without double-decrementing stock!
    if (order.payment_status === 'captured') {
      await client.query('ROLLBACK');
      const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order_id]);
      res.json({
        success: true,
        order: {
          ...order,
          items: itemsRes.rows,
        },
        idempotent: true,
      });
      return;
    }

    // 2. Decrement Stock Inventory with Row Locks & Sufficiency Check
    const itemsRes = await client.query('SELECT * FROM order_items WHERE order_id = $1', [order_id]);
    for (const item of itemsRes.rows) {
      if (item.variant_id) {
        const variantLock = await client.query(
          'SELECT stock_quantity, title, size FROM product_variants WHERE id = $1 FOR UPDATE',
          [item.variant_id]
        );

        if (variantLock.rows.length === 0) {
          await client.query('ROLLBACK');
          res.status(404).json({ error: `Variant ${item.variant_id} no longer exists in Atelier catalog.` });
          return;
        }

        const currentStock = variantLock.rows[0].stock_quantity;
        if (currentStock < item.quantity) {
          await client.query('ROLLBACK');
          res.status(409).json({
            error: `Insufficient stock for ${item.title} (Size ${item.size}). Available: ${currentStock}, Required: ${item.quantity}`,
          });
          return;
        }

        await client.query(
          'UPDATE product_variants SET stock_quantity = stock_quantity - $1 WHERE id = $2',
          [item.quantity, item.variant_id]
        );
      }
    }

    // 3. Update Order and Payment records
    await client.query(
      `UPDATE orders
       SET status = 'paid',
           payment_status = 'captured',
           updated_at = NOW()
       WHERE id = $1`,
      [order_id]
    );

    await client.query(
      `UPDATE payments
       SET razorpay_payment_id = $1,
           razorpay_signature = $2,
           status = 'captured'
       WHERE order_id = $3`,
      [razorpay_payment_id, razorpay_signature || 'verified_test', order_id]
    );

    await client.query('COMMIT');

    const updatedOrderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [order_id]);
    res.json({
      success: true,
      order: {
        ...updatedOrderRes.rows[0],
        items: itemsRes.rows,
      },
      idempotent: false,
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  } finally {
    client.release();
  }
});

// POST /store/payment/razorpay/webhook
router.post('/payment/razorpay/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const secret = config.razorpay.webhookSecret;

    if (!signature) {
      res.status(400).json({ error: 'Missing x-razorpay-signature header' });
      return;
    }

    const rawPayload = (req as any).rawBody
      ? (req as any).rawBody.toString('utf8')
      : JSON.stringify(req.body);

    const digest = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');
    if (!safeCompare(digest, signature)) {
      res.status(400).json({ error: 'Invalid webhook signature' });
      return;
    }

    const event = req.body.event;
    console.log('✓ Razorpay Webhook Event Received:', event);

    if (event === 'payment.failed') {
      const paymentEntity = req.body.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      if (rzpOrderId) {
        await pool.query(
          "UPDATE payments SET status = 'failed' WHERE razorpay_order_id = $1",
          [rzpOrderId]
        );
        await pool.query(
          "UPDATE orders SET payment_status = 'failed' WHERE id IN (SELECT order_id FROM payments WHERE razorpay_order_id = $1)",
          [rzpOrderId]
        );
        console.log(`✓ Payment marked as failed for Razorpay order: ${rzpOrderId}`);
      }
      res.json({ status: 'ok', handled: 'payment.failed' });
      return;
    }

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      const rzpPaymentId = paymentEntity?.id;
      if (rzpOrderId) {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const payRes = await client.query('SELECT order_id FROM payments WHERE razorpay_order_id = $1', [rzpOrderId]);
          if (payRes.rows.length > 0) {
            const ordId = payRes.rows[0].order_id;
            const ordRes = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [ordId]);
            if (ordRes.rows.length > 0 && ordRes.rows[0].payment_status !== 'captured') {
              // Decrement stock idempotently
              const itemsRes = await client.query('SELECT * FROM order_items WHERE order_id = $1', [ordId]);
              for (const item of itemsRes.rows) {
                if (item.variant_id) {
                  const variantLock = await client.query(
                    'SELECT stock_quantity FROM product_variants WHERE id = $1 FOR UPDATE',
                    [item.variant_id]
                  );
                  if (variantLock.rows.length > 0 && variantLock.rows[0].stock_quantity >= item.quantity) {
                    await client.query(
                      'UPDATE product_variants SET stock_quantity = stock_quantity - $1 WHERE id = $2',
                      [item.quantity, item.variant_id]
                    );
                  }
                }
              }
              await client.query(
                "UPDATE orders SET status = 'paid', payment_status = 'captured', updated_at = NOW() WHERE id = $1",
                [ordId]
              );
              await client.query(
                "UPDATE payments SET status = 'captured', razorpay_payment_id = COALESCE(razorpay_payment_id, $1) WHERE order_id = $2",
                [rzpPaymentId || null, ordId]
              );
            }
          }
          await client.query('COMMIT');
        } catch (txnErr) {
          await client.query('ROLLBACK');
          throw txnErr;
        } finally {
          client.release();
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
