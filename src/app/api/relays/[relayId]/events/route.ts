import { z } from 'zod';
import { guest } from '@/lib/auth';
import { ApiError, fail, ok } from '@/lib/api';
import { pool } from '@/lib/db';
export async function GET(_req:Request, context:{params:Promise<{relayId:string}>}) { try {
 const {relayId}=await context.params; if(!z.string().uuid().safeParse(relayId).success) throw new ApiError('NOT_FOUND','Relay not found.',404);
 const user=await guest(); const access=await pool.query('SELECT r.expires_at FROM relay_participants p JOIN relays r ON r.id=p.relay_id WHERE p.relay_id=$1 AND p.guest_id=$2',[relayId,user.id]); if(!access.rowCount) throw new ApiError('NOT_FOUND','Relay not found.',404);if(new Date(access.rows[0].expires_at)<=new Date())throw new ApiError('RELAY_EXPIRED','This relay has expired.',410);
 const events=await pool.query(`SELECT sequence,actor_alias "actorAlias",event_type "eventType",context_type context,context_source "contextSource",interaction,evidence_json evidence,delta_json delta,resulting_state_json state,narrative,created_at "createdAt" FROM relay_events WHERE relay_id=$1 ORDER BY sequence`,[relayId]); return ok(events.rows);
} catch(e){return fail(e);} }
