import { Pool } from 'pg';
import { config } from '../config';
import { runMigrations } from './migrate';

function sanitizeDatabaseUrl(url: string, isSsl: boolean): string {
  if (!isSsl) return url;
  // If connection string contains sslmode query parameter (e.g. sslmode=require),
  // adjust to sslmode=no-verify so pg-connection-string does not overwrite
  // { rejectUnauthorized: false } with an empty object (which forces rejectUnauthorized: true).
  if (/([?&])sslmode=[^&]*/i.test(url)) {
    return url.replace(/([?&])sslmode=[^&]*/i, (_match, prefix) => `${prefix}sslmode=no-verify`);
  }
  if (/([?&])ssl=[^&]*/i.test(url)) {
    return url.replace(/([?&])ssl=[^&]*/i, (_match, prefix) => `${prefix}ssl=no-verify`);
  }
  return url;
}

export const pool = new Pool({
  connectionString: sanitizeDatabaseUrl(config.databaseUrl, config.databaseSsl),
  max: parseInt(process.env.DB_POOL_MAX || '15', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,
});

export async function initDatabase(): Promise<void> {
  try {
    await runMigrations(pool);
    console.log('✓ WAAK Database connected and schema synchronized');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  }
}
