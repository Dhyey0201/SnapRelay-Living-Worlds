import { z } from 'zod';
import { guest } from '@/lib/auth';
import { ApiError, fail, ok, sameOrigin } from '@/lib/api';
import { pool } from '@/lib/db';
const idSchema = z.string().uuid();
export async function GET(_request: Request, context: { params: Promise<{relayId:string}> }) { try {
  const { relayId } = await context.params; if (!idSchema.safeParse(relayId).success) throw new ApiError('NOT_FOUND','Relay not found.',404);
  const user = await guest(); const result = await pool.query(`SELECT r.*, holder.alias holder_alias, (SELECT count(*) FROM relay_events e WHERE e.relay_id=r.id)::int event_count,
    (SELECT expires_at FROM relay_invites i WHERE i.relay_id=r.id AND i.status='PENDING' LIMIT 1) invite_expires_at
    FROM relays r JOIN relay_participants p ON p.relay_id=r.id AND p.guest_id=$2 JOIN relay_participants holder ON holder.relay_id=r.id AND holder.guest_id=r.current_holder_guest_id WHERE r.id=$1`, [relayId,user.id]);
  if (!result.rowCount) throw new ApiError('NOT_FOUND','Relay not found.',404);
  const r=result.rows[0]; if (new Date(r.expires_at) <= new Date()) throw new ApiError('RELAY_EXPIRED','This relay has expired.',410);
  const canHold=r.current_holder_guest_id===user.id && r.status==='HELD';
  return ok({relayId,version:r.version,state:r.state_json,status:r.status,holderAlias:r.holder_alias,permissions:{canEvolve:canHold&&r.last_evolution_turn<r.turn_number,canInvite:canHold&&r.last_evolution_turn===r.turn_number,canCancelInvite:canHold&&r.status==='INVITED',canDelete:r.creator_guest_id===user.id},eventCount:r.event_count,expiresAt:r.expires_at,inviteExpiresAt:r.invite_expires_at});
} catch(e){return fail(e);} }
export async function DELETE(request: Request, context: {params:Promise<{relayId:string}>}) { try {
  sameOrigin(request);
  const {relayId}=await context.params;if(!idSchema.safeParse(relayId).success)throw new ApiError('NOT_FOUND','Relay not found.',404);const user=await guest(); const result=await pool.query('DELETE FROM relays WHERE id=$1 AND creator_guest_id=$2 RETURNING id',[relayId,user.id]);
  if(!result.rowCount) throw new ApiError('NOT_FOUND','Relay not found or you cannot delete it.',404); return new Response(null,{status:204});
} catch(e){return fail(e);} }
