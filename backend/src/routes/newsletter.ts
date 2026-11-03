import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { newsletterRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Standard RFC 5322 compliant simplified email regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * POST /store/newsletter
 * Subscribes a patron's email for private atelier curation
 */
router.post('/', newsletterRateLimiter, async (req: Request, res: Response) => {
  try {
    const rawEmail = req.body?.email;

    if (!rawEmail || typeof rawEmail !== 'string') {
      res.status(400).json({ error: 'A valid email address is required.' });
      return;
    }

    const email = rawEmail.trim().toLowerCase();

    if (!email || email.length > 255 || email.includes('..') || !EMAIL_REGEX.test(email)) {
      res.status(400).json({ error: 'Please provide a valid email format (e.g. patron@example.com).' });
      return;
    }

    const source = typeof req.body?.source === 'string' ? req.body.source.slice(0, 50) : 'footer';

    // 1. Check if patron is already subscribed
    const existing = await pool.query(
      'SELECT id, status FROM newsletter_subscribers WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0 && existing.rows[0].status === 'subscribed') {
      res.status(200).json({
        success: true,
        duplicate: true,
        message: 'Your email is already registered for WAAK private atelier curation.',
      });
      return;
    }

    // 2. Insert or reactivate subscription using parameterized query
    const subscriberId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await pool.query(
      `INSERT INTO newsletter_subscribers (id, email, status, source, consent_recorded, created_at, updated_at)
       VALUES ($1, $2, 'subscribed', $3, true, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE
       SET status = 'subscribed', updated_at = NOW()`,
      [subscriberId, email, source]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing to WAAK private atelier curation.',
    });
  } catch (error: any) {
    // Avoid logging complete email address or exposing stack traces
    console.error('Newsletter subscription error:', error.message || 'Database error');
    res.status(500).json({ error: 'An error occurred while registering your subscription. Please try again later.' });
  }
});

/**
 * POST /store/newsletter/unsubscribe
 * Unsubscribes a patron from private curation
 */
router.post('/unsubscribe', newsletterRateLimiter, async (req: Request, res: Response) => {
  try {
    const rawEmail = req.body?.email;
    if (!rawEmail || typeof rawEmail !== 'string') {
      res.status(400).json({ error: 'A valid email address is required.' });
      return;
    }

    const email = rawEmail.trim().toLowerCase();
    if (!email || !EMAIL_REGEX.test(email)) {
      res.status(400).json({ error: 'Please provide a valid email format.' });
      return;
    }

    const result = await pool.query(
      `UPDATE newsletter_subscribers
       SET status = 'unsubscribed', updated_at = NOW()
       WHERE email = $1`,
      [email]
    );

    res.json({
      success: true,
      message: 'You have been unsubscribed from WAAK private atelier curation.',
      updated: (result.rowCount ?? 0) > 0,
    });
  } catch (error: any) {
    console.error('Newsletter unsubscribe error:', error.message || 'Database error');
    res.status(500).json({ error: 'An error occurred while updating your subscription.' });
  }
});

export default router;
