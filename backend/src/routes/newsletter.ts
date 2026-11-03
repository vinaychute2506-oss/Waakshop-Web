import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { pool } from '../db';
import { config } from '../config';
import { newsletterRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Standard RFC 5322 compliant simplified email regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Generates an unguessable cryptographic HMAC-SHA256 unsubscribe token
 * Bound to the normalized email and server secret.
 */
export function generateUnsubscribeToken(email: string): string {
  const secret = config.jwtSecret || 'waak_luxury_jwt_secret_key_2026_super_secure';
  return crypto
    .createHmac('sha256', secret)
    .update(`waak-unsubscribe-v1:${email.toLowerCase().trim()}`)
    .digest('hex');
}

/**
 * Validates an unsubscribe token in constant time to prevent timing attacks
 */
export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!email || !token || typeof token !== 'string') return false;
  const expected = generateUnsubscribeToken(email);
  if (token.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(token, 'utf8'), Buffer.from(expected, 'utf8'));
  } catch {
    return false;
  }
}

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
    const unsubToken = generateUnsubscribeToken(email);

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
        unsubscribeToken: unsubToken,
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
      unsubscribeToken: unsubToken,
    });
  } catch (error: any) {
    // Avoid logging complete email address or exposing stack traces
    console.error('Newsletter subscription error:', error.message || 'Database error');
    res.status(500).json({ error: 'An error occurred while registering your subscription. Please try again later.' });
  }
});

/**
 * POST /store/newsletter/unsubscribe
 * Unsubscribes a patron from private curation.
 * Requires token verification in production to prevent unauthorized third-party unsubscriptions.
 * Masks database state to prevent subscriber enumeration attacks.
 */
router.post('/unsubscribe', newsletterRateLimiter, async (req: Request, res: Response) => {
  try {
    const rawEmail = req.body?.email;
    const rawToken = req.body?.token;

    if (!rawEmail || typeof rawEmail !== 'string') {
      res.status(400).json({ error: 'A valid email address is required.' });
      return;
    }

    const email = rawEmail.trim().toLowerCase();
    if (!email || !EMAIL_REGEX.test(email)) {
      res.status(400).json({ error: 'Please provide a valid email format.' });
      return;
    }

    // Security Verification: If a token is provided, verify against cryptographic HMAC
    if (rawToken) {
      if (typeof rawToken !== 'string' || !verifyUnsubscribeToken(email, rawToken)) {
        res.status(403).json({ error: 'Invalid or forged unsubscription token.' });
        return;
      }
    } else if (config.nodeEnv === 'production') {
      // In production, token is strictly required to prevent unauthorized unsubscriptions
      res.status(400).json({ error: 'Unsubscription token is required to verify this request.' });
      return;
    }

    // Execute state transition in PostgreSQL
    await pool.query(
      `UPDATE newsletter_subscribers
       SET status = 'unsubscribed', updated_at = NOW()
       WHERE email = $1`,
      [email]
    );

    // Uniform response masks whether email was previously registered (prevents enumeration)
    res.json({
      success: true,
      message: 'You have been unsubscribed from WAAK private atelier curation.',
    });
  } catch (error: any) {
    console.error('Newsletter unsubscribe error:', error.message || 'Database error');
    res.status(500).json({ error: 'An error occurred while updating your subscription.' });
  }
});

export default router;
