import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { pool } from './db';
import { ApiError } from './api';

const COOKIE = 'snaprelay_session';
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export async function guest() {
  const jar = await cookies(); const token = jar.get(COOKIE)?.value;
  if (token) {
    const existing = await pool.query('UPDATE guests SET last_seen_at=now() WHERE session_token_hash=$1 RETURNING id,display_name', [hash(token)]);
    if (existing.rowCount) return existing.rows[0] as { id: string; display_name: string };
  }
  const requestHeaders = await headers();
  const address = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const limited = await pool.query(`INSERT INTO rate_limits(key,window_started_at,count) VALUES($1,now(),1)
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.window_started_at < now()-interval '1 minute' THEN 1 ELSE rate_limits.count+1 END,
    window_started_at=CASE WHEN rate_limits.window_started_at < now()-interval '1 minute' THEN now() ELSE rate_limits.window_started_at END RETURNING count`, [`session:${hash(address)}`]);
  if (limited.rows[0].count > 20) throw new ApiError('RATE_LIMITED','Too many new guest sessions. Please wait a minute.',429);
  const fresh = randomBytes(32).toString('base64url');
  const result = await pool.query('INSERT INTO guests(id,session_token_hash) VALUES($1,$2) RETURNING id,display_name', [randomUUID(), hash(fresh)]);
  jar.set(COOKIE, fresh, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return result.rows[0] as { id: string; display_name: string };
}
export async function requireGuest() { return guest(); }
