import { Pool } from 'pg';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  const result = await pool.query("DELETE FROM relays WHERE expires_at <= now() RETURNING id");
  console.log(`Deleted ${result.rowCount ?? 0} expired relays.`);
} finally { await pool.end(); }
