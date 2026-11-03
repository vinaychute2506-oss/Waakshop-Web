import dotenv from 'dotenv';
import path from 'path';

// Load .env if present
dotenv.config();

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
    keyId: string;
    keySecret: string;
    webhookSecret: string;
    isTestMode: boolean;
  };
  admin: {
    email: string;
    defaultPasswordBlocked: boolean;
  };
}

const DEFAULT_DEV_JWT = 'waak_luxury_jwt_secret_key_2026_super_secure';
const DEFAULT_DEV_DB = 'postgres://waak_admin:waak_secret_2026@localhost:5432/waak_commerce';
const DEFAULT_DEV_WEBHOOK_SECRET = 'waak_webhook_secret_2026';

function parseCorsOrigins(raw?: string): string[] {
  if (!raw) {
    return ['http://localhost:5173', 'http://127.0.0.1:5173'];
  }
  return raw.split(',').map((o) => o.trim()).filter(Boolean);
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

  const port = parseInt(process.env.PORT || '9000', 10);
  const databaseUrl = process.env.DATABASE_URL || DEFAULT_DEV_DB;
  const redisUrl = process.env.REDIS_URL || undefined;
  const jwtSecret = process.env.JWT_SECRET || DEFAULT_DEV_JWT;

  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_waak2026demo';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'waakSecretRazorpayKey2026';
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || DEFAULT_DEV_WEBHOOK_SECRET;

  const allowMockPayments = process.env.ALLOW_MOCK_PAYMENTS === 'true';

  // Strict Validation for Staging / Production
  if (isProductionLike) {
    const missing: string[] = [];

    if (!process.env.DATABASE_URL || process.env.DATABASE_URL === DEFAULT_DEV_DB) {
      missing.push('DATABASE_URL (must be configured with production/staging credentials, not default dev)');
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEFAULT_DEV_JWT) {
      missing.push('JWT_SECRET (must be a high-entropy secret >= 32 chars, not default dev)');
    } else if (process.env.JWT_SECRET.length < 32) {
      missing.push('JWT_SECRET must be at least 32 characters long for security');
    }

    if (!process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET === DEFAULT_DEV_WEBHOOK_SECRET) {
      missing.push('RAZORPAY_WEBHOOK_SECRET (must be configured from Razorpay Dashboard)');
    }

    if (!process.env.CORS_ORIGIN) {
      missing.push('CORS_ORIGIN (must specify allowed frontend domain(s))');
    }

    // Phase 2.2 Safety Constraint: Disallow live credentials until Phase 2.4
    if (keyId.startsWith('rzp_live_')) {
      throw new Error(
        'SECURITY GUARD ACTIVATED: Live Razorpay keys (rzp_live_...) are strictly prohibited during Phase 2.2 staging preparation. Use test credentials (rzp_test_...).'
      );
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

  const isTestMode = keyId.startsWith('rzp_test_');

  return {
    nodeEnv,
    port,
    databaseUrl,
    databaseSsl: process.env.DATABASE_SSL === 'true' || databaseUrl.includes('sslmode=require'),
    redisUrl,
    jwtSecret,
    corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN),
    allowMockPayments,
    razorpay: {
      keyId,
      keySecret,
      webhookSecret,
      isTestMode,
    },
    admin: {
      email: (process.env.ADMIN_EMAIL || 'atelier@waak.in').toLowerCase().trim(),
      defaultPasswordBlocked: isProductionLike,
    },
  };
}

export const config = validateAndLoadConfig();
