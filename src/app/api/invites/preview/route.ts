import { createHash } from 'node:crypto';
import { z } from 'zod';
import { guest } from '@/lib/auth';
import { ApiError, body, fail, ok, rateLimit, sameOrigin } from '@/lib/api';
import { pool } from '@/lib/db';
const schema=z.object({token:z.string().min(30).max(100)}).strict();
export async function POST(request:Request){try{
 sameOrigin(request);const user=await guest();await rateLimit(`preview:${user.id}`,25);const {token}=await body(request,schema);const hash=createHash('sha256').update(token).digest('hex');
 const q=await pool.query(`SELECT i.expires_at,i.status,r.name,r.state_json,r.id relay_id,s.alias sender_alias,(SELECT count(*) FROM relay_events e WHERE e.relay_id=r.id)::int chapter_count FROM relay_invites i JOIN relays r ON r.id=i.relay_id JOIN relay_participants s ON s.relay_id=r.id AND s.guest_id=i.sender_guest_id WHERE i.token_hash=$1`,[hash]);
 if(!q.rowCount||q.rows[0].status!=='PENDING'||new Date(q.rows[0].expires_at)<=new Date())throw new ApiError('INVITE_INVALID','This invite is expired or has already been used.',404);
 const r=q.rows[0];return ok({relayId:r.relay_id,relayName:r.name,previewState:r.state_json,senderAlias:r.sender_alias,chapterCount:r.chapter_count,expiresAt:r.expires_at});
}catch(e){return fail(e);} }
