import { z } from 'zod';
import { guest } from '@/lib/auth';
import { body, fail, ok, sameOrigin } from '@/lib/api';
import { pool } from '@/lib/db';
const schema = z.object({ displayName: z.string().trim().min(1).max(24).optional() }).strict();
export async function POST(request: Request) { try {
  sameOrigin(request); const input = await body(request, schema); const user = await guest();
  if (input.displayName) await pool.query('UPDATE guests SET display_name=$1 WHERE id=$2', [input.displayName, user.id]);
  return ok({ guestId: user.id, displayName: input.displayName ?? user.display_name });
} catch (e) { return fail(e); } }
