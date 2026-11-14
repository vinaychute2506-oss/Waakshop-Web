import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();
const registerAttempts = new Map<string, RateLimitRecord>();
const newsletterAttempts = new Map<string, RateLimitRecord>();
const shippingAttempts = new Map<string, RateLimitRecord>();

function cleanExpiredRecords(map: Map<string, RateLimitRecord>) {
  const now = Date.now();
  for (const [key, record] of map.entries()) {
    if (now > record.resetTime) {
      map.delete(key);
    }
  }
}

// Clean every 5 minutes
setInterval(() => {
  cleanExpiredRecords(loginAttempts);
  cleanExpiredRecords(registerAttempts);
  cleanExpiredRecords(newsletterAttempts);
  cleanExpiredRecords(shippingAttempts);
}, 5 * 60 * 1000);

export function loginRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const email = (req.body?.email || '').toLowerCase().trim();
  const key = `${ip}_${email}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10; // Max 10 attempts per 15 min window

  const record = loginAttempts.get(key);

  if (!record || now > record.resetTime) {
    loginAttempts.set(key, { count: 1, resetTime: now + windowMs });
    next();
    return;
  }

  if (record.count >= maxAttempts) {
    const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
    res.set('Retry-After', String(retryAfterSec));
    res.status(429).json({
      error: `Too many login attempts. Please wait ${Math.ceil(retryAfterSec / 60)} minutes before trying again.`,
    });
    return;
  }

  record.count += 1;
  next();
}

export function registerRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxAttempts = 20;

  const record = registerAttempts.get(ip);

  if (!record || now > record.resetTime) {
    registerAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    next();
    return;
  }

  if (record.count >= maxAttempts) {
    res.status(429).json({
      error: 'Account creation rate limit exceeded for this IP. Please try again later.',
    });
    return;
  }

  record.count += 1;
  next();
}

export function newsletterRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxAttempts = 30;

  const record = newsletterAttempts.get(ip);

  if (!record || now > record.resetTime) {
    newsletterAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    next();
    return;
  }

  if (record.count >= maxAttempts) {
    res.status(429).json({
      error: 'Too many newsletter subscription requests from this network. Please try again later.',
    });
    return;
  }

  record.count += 1;
  next();
}

export function shippingRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxAttempts = 30; // Max 30 lookups per minute

  const record = shippingAttempts.get(ip);
  if (!record || now > record.resetTime) {
    shippingAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    next();
    return;
  }

  if (record.count >= maxAttempts) {
    res.status(429).json({
      error: 'Too many delivery check requests. Please wait a moment before trying another PIN code.',
    });
    return;
  }

  record.count += 1;
  next();
}

export function resetRateLimits(): void {
  loginAttempts.clear();
  registerAttempts.clear();
  newsletterAttempts.clear();
  shippingAttempts.clear();
}
