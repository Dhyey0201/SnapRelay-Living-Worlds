import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { guest } from '@/lib/auth';
import { ApiError, body, fail, ok, rateLimit, sameOrigin } from '@/lib/api';
import { transaction } from '@/lib/db';

const schema=z.object({requestId:z.string().uuid(),expectedVersion:z.number().int().positive()}).strict();
export async function POST(request:Request,context:{params:Promise<{relayId:string}>}){try{
 sameOrigin(request);
 const user=await guest();
 await rateLimit(`cancel:${user.id}`,15);
 const {relayId}=await context.params;
 const input=await body(request,schema);
 if(!z.string().uuid().safeParse(relayId).success)throw new ApiError('NOT_FOUND','Relay not found.',404);
 const out=await transaction(async c=>{
  const prior=await c.query('SELECT operation,relay_id,response_json FROM mutation_requests WHERE guest_id=$1 AND request_id=$2',[user.id,input.requestId]);
  if(prior.rowCount){if(prior.rows[0].operation!=='CANCEL'||prior.rows[0].relay_id!==relayId)throw new ApiError('IDEMPOTENCY_MISMATCH','Request ID was already used.',409);return prior.rows[0].response_json;}
  const r=await c.query('SELECT * FROM relays WHERE id=$1 FOR UPDATE',[relayId]);
  if(!r.rowCount)throw new ApiError('NOT_FOUND','Relay not found.',404);
  const row=r.rows[0];
  if(row.current_holder_guest_id!==user.id||row.status!=='INVITED')throw new ApiError('NOT_HOLDER','Only the sender can cancel this invite.',403);
  if(row.version!==input.expectedVersion)throw new ApiError('VERSION_CONFLICT','Milo changed. Refresh and try again.',409);
  const inv=await c.query("UPDATE relay_invites SET status='CANCELLED' WHERE relay_id=$1 AND sender_guest_id=$2 AND status='PENDING' RETURNING id",[relayId,user.id]);
  if(!inv.rowCount)throw new ApiError('INVITE_INVALID','No pending invite was found.',409);
  const version=row.version+1;
  await c.query("UPDATE relays SET status='HELD',version=$1,updated_at=now() WHERE id=$2",[version,relayId]);
  const participant=await c.query('SELECT alias FROM relay_participants WHERE relay_id=$1 AND guest_id=$2',[relayId,user.id]);
  const alias=participant.rows[0]?.alias??'Friend';
  await c.query("INSERT INTO relay_events(id,relay_id,sequence,actor_guest_id,actor_alias,event_type,resulting_state_json,narrative) VALUES($1,$2,$3,$4,$5,'INVITE_CANCELLED',$6,$7)",[randomUUID(),relayId,version,user.id,alias,row.state_json,'The invitation was cancelled.']);
  const response={relayId,version,state:row.state_json};
  await c.query("INSERT INTO mutation_requests(guest_id,request_id,relay_id,operation,response_json) VALUES($1,$2,$3,'CANCEL',$4)",[user.id,input.requestId,relayId,response]);
  return response;
 });
 return ok(out);
}catch(e){return fail(e);} }
