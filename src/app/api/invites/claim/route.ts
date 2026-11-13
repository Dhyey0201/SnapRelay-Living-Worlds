import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { guest } from '@/lib/auth';
import { ApiError, body, fail, ok, rateLimit, sameOrigin } from '@/lib/api';
import { transaction } from '@/lib/db';
const schema=z.object({token:z.string().min(30).max(100),alias:z.string().trim().min(1).max(24),requestId:z.string().uuid()}).strict();
export async function POST(request:Request){try{
 sameOrigin(request);const user=await guest();await rateLimit(`claim:${user.id}`,15);const input=await body(request,schema);const tokenHash=createHash('sha256').update(input.token).digest('hex');
 const result=await transaction(async c=>{
  const found=await c.query('SELECT relay_id FROM relay_invites WHERE token_hash=$1',[tokenHash]);if(!found.rowCount)throw new ApiError('INVITE_INVALID','This invite is expired or has already been used.',404);const relayId=found.rows[0].relay_id;
  const prior=await c.query('SELECT operation,relay_id,response_json FROM mutation_requests WHERE guest_id=$1 AND request_id=$2',[user.id,input.requestId]);if(prior.rowCount){if(prior.rows[0].operation!=='CLAIM'||prior.rows[0].relay_id!==relayId)throw new ApiError('IDEMPOTENCY_MISMATCH','Request ID was already used.',409);return prior.rows[0].response_json;}
  const rq=await c.query('SELECT * FROM relays WHERE id=$1 FOR UPDATE',[relayId]);if(!rq.rowCount)throw new ApiError('INVITE_INVALID','This invite is no longer available.',404);const r=rq.rows[0];
  if(new Date(r.expires_at)<=new Date())throw new ApiError('RELAY_EXPIRED','This relay has expired.',410);
  const iq=await c.query('SELECT * FROM relay_invites WHERE token_hash=$1 AND relay_id=$2 FOR UPDATE',[tokenHash,relayId]);
  if(iq.rowCount&&iq.rows[0].status==='PENDING'&&new Date(iq.rows[0].expires_at)<=new Date()){
   await c.query("UPDATE relay_invites SET status='EXPIRED' WHERE id=$1",[iq.rows[0].id]);
   const version=r.version+1;const holder=await c.query('SELECT alias FROM relay_participants WHERE relay_id=$1 AND guest_id=$2',[relayId,r.current_holder_guest_id]);
   await c.query("UPDATE relays SET status='HELD',version=$1,updated_at=now() WHERE id=$2",[version,relayId]);
   await c.query("INSERT INTO relay_events(id,relay_id,sequence,actor_guest_id,actor_alias,event_type,resulting_state_json,narrative) VALUES($1,$2,$3,$4,$5,'INVITE_EXPIRED',$6,$7)",[randomUUID(),relayId,version,r.current_holder_guest_id,holder.rows[0]?.alias??'Friend',r.state_json,'The invitation expired. Milo is ready for a fresh link.']);
   return {expired:true as const};
  }
  if(!iq.rowCount||iq.rows[0].status!=='PENDING'||r.status!=='INVITED')throw new ApiError('INVITE_ALREADY_USED','This invite is no longer available.',409);
  if(r.current_holder_guest_id===user.id||r.creator_guest_id===user.id)throw new ApiError('SELF_CLAIM','Open this invite in another browser session.',409);
  const version=r.version+1;const sequence=version;await c.query('INSERT INTO relay_participants(relay_id,guest_id,alias) VALUES($1,$2,$3) ON CONFLICT(relay_id,guest_id) DO UPDATE SET alias=EXCLUDED.alias',[relayId,user.id,input.alias]);
  await c.query("UPDATE relays SET current_holder_guest_id=$1,status='HELD',turn_number=turn_number+1,version=$2,updated_at=now() WHERE id=$3",[user.id,version,relayId]);await c.query("UPDATE relay_invites SET status='REDEEMED',redeemed_by_guest_id=$1,redeemed_at=now() WHERE id=$2",[user.id,iq.rows[0].id]);
  await c.query("INSERT INTO relay_events(id,relay_id,sequence,actor_guest_id,actor_alias,event_type,resulting_state_json,narrative) VALUES($1,$2,$3,$4,$5,'TRANSFERRED',$6,$7)",[randomUUID(),relayId,sequence,user.id,input.alias,r.state_json,`${input.alias} is now carrying ${r.name}.`]);
  const out={relayId,version,state:r.state_json,permissions:{canEvolve:true,canInvite:false}};await c.query("INSERT INTO mutation_requests(guest_id,request_id,relay_id,operation,response_json) VALUES($1,$2,$3,'CLAIM',$4)",[user.id,input.requestId,relayId,out]);return out;
 });if('expired'in result)throw new ApiError('INVITE_EXPIRED','This invite has expired. Ask the holder for a fresh link.',410);return ok(result);
}catch(e){return fail(e);} }
