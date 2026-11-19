import dotenv from 'dotenv';
import path from 'path';

// Load .env if present
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

export interface AppConfig {
  nodeEnv: 'development' | 'staging' | 'production' | 'test';
  port: number;
  databaseUrl: string;
  databaseSsl: boolean;
  redisUrl?: string;
  jwtSecret: string;
  corsOrigins: string[];
  allowMockPayments: boolean;
  razorpay: {
    keyId?: string;
    keySecret?: string;
    webhookSecret?: string;
    isTestMode: boolean;
    isConfigured: boolean;
  };
  admin: {
    email: string;
    defaultPasswordBlocked: boolean;
  };
}

const DEFAULT_DEV_JWT = 'waak_luxury_jwt_secret_key_2026_super_secure';
const DEFAULT_DEV_DB = 'postgres://postgres:postgres@localhost:5432/waak_db';
const DEFAULT_DEV_WEBHOOK_SECRET = 'waak_webhook_secret_2026';

function parseCorsOrigins(raw?: string, port = 9000): string[] {
  const localSelf = [`http://localhost:${port}`, `http://127.0.0.1:${port}`];
  const defaults = [
    'https://waakshop-web.vercel.app',
    'https://waakshop-web.onrender.com',
    'https://waakshop.com',
    'https://www.waakshop.com',
  ];
  if (process.env.RENDER_EXTERNAL_URL) {
    defaults.push(process.env.RENDER_EXTERNAL_URL.replace(/\/+$/, ''));
  }

  if (!raw) {
    return Array.from(new Set(['http://localhost:5173', 'http://127.0.0.1:5173', ...defaults, ...localSelf]));
  }
  const custom = raw
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  return Array.from(new Set([...defaults, ...custom, ...localSelf]));
}

function validateAndLoadConfig(): AppConfig {
  const rawNodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();
  const nodeEnv: AppConfig['nodeEnv'] =
    rawNodeEnv === 'production'
      ? 'production'
      : rawNodeEnv === 'staging'
      ? 'staging'
      : rawNodeEnv === 'test'
      ? 'test'
      : 'development';

  const isProductionLike = nodeEnv === 'production' || nodeEnv === 'staging';

  const parsedPort = parseInt(process.env.PORT || '9000', 10);
  const port = isNaN(parsedPort) || parsedPort <= 0 ? 9000 : parsedPort;
  const databaseUrl = process.env.DATABASE_URL || DEFAULT_DEV_DB;
  const redisUrl = process.env.REDIS_URL || undefined;
  const jwtSecret = process.env.JWT_SECRET || (isProductionLike ? '' : DEFAULT_DEV_JWT);

  const keyId = process.env.RAZORPAY_KEY_ID || (isProductionLike ? undefined : 'rzp_test_waak2026demo');
  const keySecret = process.env.RAZORPAY_KEY_SECRET || (isProductionLike ? undefined : 'waakSecretRazorpayKey2026');
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || (isProductionLike ? undefined : DEFAULT_DEV_WEBHOOK_SECRET);

  const allowMockPayments = process.env.ALLOW_MOCK_PAYMENTS === 'true';

  // Strict Validation for Staging / Production
  if (isProductionLike) {
    const missing: string[] = [];

    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder') || process.env.DATABASE_URL === DEFAULT_DEV_DB) {
      missing.push('DATABASE_URL (must be configured with production/staging PostgreSQL credentials)');
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEFAULT_DEV_JWT) {
      missing.push('JWT_SECRET (must be a high-entropy secret >= 32 chars, not default dev)');
    } else if (process.env.JWT_SECRET.length < 32) {
      missing.push('JWT_SECRET must be at least 32 characters long for security');
    }

    if (!process.env.CORS_ORIGIN) {
      missing.push('CORS_ORIGIN (must specify allowed frontend domain(s), e.g. https://waakshop-web.vercel.app)');
    }

    if (!keyId || !keySecret) {
      console.log('ℹ️ Razorpay payments: Inactive (RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not provided). Checkout and payment endpoints safely return HTTP 503.');
    } else if (keyId.startsWith('rzp_live_')) {
      // Phase 2.2 Safety Constraint: Disallow live credentials until Phase 2.4
      throw new Error(
        'SECURITY GUARD ACTIVATED: Live Razorpay keys (rzp_live_...) are strictly prohibited during Phase 2.2 staging preparation. Use test credentials (rzp_test_...).'
      );
    }

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.log('ℹ️ Razorpay webhooks: Inactive (RAZORPAY_WEBHOOK_SECRET not provided). Webhook route safely returns HTTP 503.');
    }

    if (missing.length > 0) {
      throw new Error(
        `FATAL CONFIGURATION ERROR in ${nodeEnv.toUpperCase()} environment:\n` +
          missing.map((m) => `  - Missing or insecure variable: ${m}`).join('\n') +
          '\nAborting server start to prevent running with insecure defaults.'
      );
    }

    if (allowMockPayments && nodeEnv === 'production') {
      throw new Error('SECURITY VIOLATION: ALLOW_MOCK_PAYMENTS cannot be set to true in production mode.');
    }
  }

  const isTestMode = Boolean(keyId && keyId.startsWith('rzp_test_'));
  const isConfigured = Boolean(keyId && keySecret);

  return {
    nodeEnv,
    port,
    databaseUrl,
    databaseSsl:
      process.env.DATABASE_SSL === 'true' ||
      Boolean(
        databaseUrl &&
          (databaseUrl.includes('sslmode=require') ||
            databaseUrl.includes('supabase') ||
            databaseUrl.includes('neon.tech') ||
            databaseUrl.includes('render.com'))
      ),
    redisUrl,
    jwtSecret,
    corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN, port),
    allowMockPayments,
    razorpay: {
      keyId,
      keySecret,
      webhookSecret,
      isTestMode,
      isConfigured,
    },
    admin: {
      email: (process.env.ADMIN_EMAIL || 'atelier@waak.in').toLowerCase().trim(),
      defaultPasswordBlocked: isProductionLike,
    },
  };
}

export const config = validateAndLoadConfig();
