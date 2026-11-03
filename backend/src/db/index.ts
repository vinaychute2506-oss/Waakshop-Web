import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgres://waak_admin:waak_secret_2026@localhost:5432/waak_commerce';

export const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function initDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    const possiblePaths = [
      path.join(__dirname, 'schema.sql'),
      path.join(__dirname, '../../src/db/schema.sql'),
      path.join(__dirname, '../src/db/schema.sql'),
      path.join(process.cwd(), 'src/db/schema.sql'),
      path.join(process.cwd(), 'backend/src/db/schema.sql'),
    ];
    let sql = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        sql = fs.readFileSync(p, 'utf8');
        break;
      }
    }
    if (!sql) {
      throw new Error('schema.sql could not be found in search paths');
    }
    await client.query(sql);
    console.log('✓ WAAK Database schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  } finally {
    client.release();
  }
}
