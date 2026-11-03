import { Pool } from 'pg';
import { config } from '../config';
import { runMigrations } from './migrate';

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: config.nodeEnv === 'production' || config.nodeEnv === 'staging' ? { rejectUnauthorized: false } : undefined,
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
