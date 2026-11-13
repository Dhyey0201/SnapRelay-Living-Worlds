import { createHash, createHmac, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { guest } from '@/lib/auth';
import { ApiError, body, fail, ok, rateLimit, sameOrigin } from '@/lib/api';
import { transaction } from '@/lib/db';

const schema=z.object({requestId:z.string().uuid(),expectedVersion:z.number().int().positive()}).strict();
const tokenFor=(relayId:string,requestId:string,guestId:string)=>createHmac('sha256',process.env.SESSION_SECRET!).update(`invite:v1:${relayId}:${requestId}:${guestId}`).digest('base64url');

export async function POST(request:Request,context:{params:Promise<{relayId:string}>}){try{
 sameOrigin(request);
 const user=await guest();
 await rateLimit(`invite:${user.id}`,15);
 const {relayId}=await context.params;
 const input=await body(request,schema);
 if(!z.string().uuid().safeParse(relayId).success)throw new ApiError('NOT_FOUND','Relay not found.',404);
 if(!process.env.SESSION_SECRET||Buffer.byteLength(process.env.SESSION_SECRET)<32)throw new ApiError('SERVER_CONFIGURATION','Invite signing is not configured.',503);

 const result=await transaction(async c=>{
  const q=await c.query('SELECT * FROM relays WHERE id=$1 FOR UPDATE',[relayId]);
  if(!q.rowCount)throw new ApiError('NOT_FOUND','Relay not found.',404);
  const r=q.rows[0];
  if(new Date(r.expires_at)<=new Date())throw new ApiError('RELAY_EXPIRED','This relay has expired.',410);
  if(r.current_holder_guest_id!==user.id)throw new ApiError('NOT_HOLDER','Only the holder can pass Milo.',403);

  if(r.status==='INVITED'){
   const active=await c.query("SELECT * FROM relay_invites WHERE relay_id=$1 AND status='PENDING' FOR UPDATE",[relayId]);
   if(active.rowCount&&new Date(active.rows[0].expires_at)<=new Date()){
    const expired=active.rows[0];
    await c.query("UPDATE relay_invites SET status='EXPIRED' WHERE id=$1",[expired.id]);
    const version=r.version+1;
    const participant=await c.query('SELECT alias FROM relay_participants WHERE relay_id=$1 AND guest_id=$2',[relayId,user.id]);
    const alias=participant.rows[0]?.alias??'Friend';
    await c.query("UPDATE relays SET status='HELD',version=$1,updated_at=now() WHERE id=$2",[version,relayId]);
    await c.query("INSERT INTO relay_events(id,relay_id,sequence,actor_guest_id,actor_alias,event_type,resulting_state_json,narrative) VALUES($1,$2,$3,$4,$5,'INVITE_EXPIRED',$6,$7)",[randomUUID(),relayId,version,user.id,alias,r.state_json,'The invitation expired. Milo is ready for a fresh link.']);
    return {reconciled:true as const};
   }
  }

  const previous=await c.query('SELECT operation,relay_id,response_json FROM mutation_requests WHERE guest_id=$1 AND request_id=$2',[user.id,input.requestId]);
  if(previous.rowCount){
   if(previous.rows[0].operation!=='INVITE'||previous.rows[0].relay_id!==relayId)throw new ApiError('IDEMPOTENCY_MISMATCH','Request ID was already used.',409);
   const token=tokenFor(relayId,input.requestId,user.id);
   const pending=await c.query("SELECT expires_at FROM relay_invites WHERE relay_id=$1 AND token_hash=$2 AND status='PENDING'",[relayId,createHash('sha256').update(token).digest('hex')]);
   if(!pending.rowCount)throw new ApiError('INVITE_EXPIRED','Create a fresh invite.',409);
   return {...previous.rows[0].response_json,inviteUrl:`${process.env.NEXT_PUBLIC_BASE_URL}/join#t=${token}`,expiresAt:pending.rows[0].expires_at};
  }
  if(r.version!==input.expectedVersion)throw new ApiError('VERSION_CONFLICT','Milo changed. Refresh to continue.',409);
  if(r.status!=='HELD')throw new ApiError('INVITE_PENDING','There is already an active invite.',409);
  if(r.last_evolution_turn!==r.turn_number)throw new ApiError('EVOLVE_FIRST','Evolve Milo before passing it on.',409);

  const token=tokenFor(relayId,input.requestId,user.id);
  const tokenHash=createHash('sha256').update(token).digest('hex');
  const expires=new Date(Math.min(Date.now()+86400000,new Date(r.expires_at).getTime()));
  const inviteId=randomUUID();
  const version=r.version+1;
  const participant=await c.query('SELECT alias FROM relay_participants WHERE relay_id=$1 AND guest_id=$2',[relayId,user.id]);
  const alias=participant.rows[0]?.alias??'Friend';
  await c.query('INSERT INTO relay_invites(id,relay_id,sender_guest_id,token_hash,expires_at) VALUES($1,$2,$3,$4,$5)',[inviteId,relayId,user.id,tokenHash,expires]);
  await c.query("UPDATE relays SET status='INVITED',version=$1,updated_at=now() WHERE id=$2",[version,relayId]);
  await c.query("INSERT INTO relay_events(id,relay_id,sequence,actor_guest_id,actor_alias,event_type,resulting_state_json,narrative) VALUES($1,$2,$3,$4,$5,'INVITED',$6,$7)",[randomUUID(),relayId,version,user.id,alias,r.state_json,`${alias} sent ${r.name} on a new adventure.`]);
  const safe={relayId,version,expiresAt:expires.toISOString()};
  await c.query("INSERT INTO mutation_requests(guest_id,request_id,relay_id,operation,response_json) VALUES($1,$2,$3,'INVITE',$4)",[user.id,input.requestId,relayId,safe]);
  return {...safe,inviteUrl:`${process.env.NEXT_PUBLIC_BASE_URL}/join#t=${token}`};
 });
 if('reconciled'in result)throw new ApiError('INVITE_EXPIRED','The old invitation expired. Refresh, then create a fresh link.',409);
 return ok(result,201);
}catch(e){return fail(e);} }
