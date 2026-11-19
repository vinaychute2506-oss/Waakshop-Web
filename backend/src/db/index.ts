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

import bcrypt from 'bcryptjs';

let isBootstrapping = false;

async function bootstrapDatabaseData(): Promise<void> {
  if (isBootstrapping) return;
  isBootstrapping = true;

  try {
    const adminEmail = config.admin.email;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // 1. Check if products need bootstrapping
    const countRes = await pool.query('SELECT count(*) as count FROM products');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      console.log('ℹ️ Empty database detected; bootstrapping signature Atelier collection...');
      const { seedDatabase } = await import('./seed');
      await seedDatabase(true);
      return;
    }

    // 2. Ensure admin user exists or synchronize password if ADMIN_PASSWORD is provided
    const existing = await pool.query('SELECT id FROM admin_users WHERE email = $1', [adminEmail]);
    if (existing.rows.length === 0) {
      if (adminPassword) {
        const hash = await bcrypt.hash(adminPassword, 10);
        await pool.query(
          `INSERT INTO admin_users (id, email, password_hash, first_name, last_name, role)
           VALUES ('admin_waak_01', $1, $2, 'WAAK', 'Atelier Director', 'admin')
           ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
          [adminEmail, hash]
        );
        console.log(`✓ Admin account initialized for ${adminEmail}`);
      } else if (!config.admin.defaultPasswordBlocked) {
        const hash = await bcrypt.hash('waakAdmin2026!', 10);
        await pool.query(
          `INSERT INTO admin_users (id, email, password_hash, first_name, last_name, role)
           VALUES ('admin_waak_01', $1, $2, 'WAAK', 'Atelier Director', 'admin')
           ON CONFLICT (email) DO NOTHING`,
          [adminEmail, hash]
        );
      } else {
        console.warn(`⚠️ [Admin Auth] No admin user exists for ${adminEmail}. Set ADMIN_PASSWORD in environment to initialize.`);
      }
    } else if (adminPassword) {
      const hash = await bcrypt.hash(adminPassword, 10);
      await pool.query('UPDATE admin_users SET password_hash = $1 WHERE email = $2', [hash, adminEmail]);
      console.log(`✓ Admin password synchronized from environment for ${adminEmail}`);
    }
  } catch (err: any) {
    console.warn('Database bootstrap notice:', err.message || err);
  } finally {
    isBootstrapping = false;
  }
}

export async function initDatabase(): Promise<void> {
  try {
    await runMigrations(pool);
    console.log('✓ WAAK Database connected and schema synchronized');
    await bootstrapDatabaseData();
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  }
}
