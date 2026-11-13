import { Pool, type PoolClient } from 'pg';
const globalForPool = globalThis as unknown as { snaprelayPool?: Pool };
export const pool = globalForPool.snaprelayPool ?? new Pool({ connectionString: process.env.DATABASE_URL, max: 10, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined });
if (process.env.NODE_ENV !== 'production') globalForPool.snaprelayPool = pool;
export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try { await client.query('BEGIN'); const result = await fn(client); await client.query('COMMIT'); return result; }
  catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
