import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export async function runMigrations(pool: Pool): Promise<void> {
  const client = await pool.connect();
  try {
    // 1. Ensure migrations tracker table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Locate migrations directory
    const candidates = [
      path.join(__dirname, 'migrations'),
      path.join(__dirname, '../../src/db/migrations'),
      path.join(__dirname, '../src/db/migrations'),
      path.join(process.cwd(), 'src/db/migrations'),
      path.join(process.cwd(), 'backend/src/db/migrations'),
    ];

    let migrationsDir = '';
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        migrationsDir = c;
        break;
      }
    }

    if (!migrationsDir) {
      console.warn('⚠️ No migrations directory found. Skipping migration runner.');
      return;
    }

    // 3. Read and sort migration files
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    // 4. Check already applied migrations
    const appliedRes = await client.query('SELECT id FROM schema_migrations');
    const appliedSet = new Set(appliedRes.rows.map((r: any) => r.id));

    let appliedCount = 0;
    for (const file of files) {
      if (!appliedSet.has(file)) {
        console.log(`Applying database migration: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`✓ Migration applied successfully: ${file}`);
          appliedCount++;
        } catch (migErr) {
          await client.query('ROLLBACK');
          console.error(`❌ Migration failed on ${file}:`, migErr);
          throw migErr;
        }
      }
    }

    if (appliedCount === 0) {
      console.log('✓ All database migrations are up to date.');
    } else {
      console.log(`✓ Completed applying ${appliedCount} new database migration(s).`);
    }
  } finally {
    client.release();
  }
}

// Standalone execution if run via node/ts-node
if (require.main === module) {
  import('./index').then(async ({ pool }) => {
    try {
      await runMigrations(pool);
      process.exit(0);
    } catch (e) {
      console.error('Fatal migration error:', e);
      process.exit(1);
    }
  });
}
