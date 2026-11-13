import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { guest } from '@/lib/auth';
import { ApiError, body, fail, ok, rateLimit, sameOrigin } from '@/lib/api';
import { transaction } from '@/lib/db';
import { evolveCharacter, type Context, type Interaction } from '@/lib/engine/evolve';
const schema=z.object({requestId:z.string().uuid(),expectedVersion:z.number().int().positive(),interaction:z.enum(['EXPLORE','PLAY','REST']),context:z.enum(['COFFEE','PLANT','BOOKS','TECH','NEUTRAL']),contextSource:z.enum(['MANUAL','DETECTED']),evidence:z.object({objectLabel:z.enum(['cup','potted plant','book','laptop']),confidence:z.number().min(0).max(1)}).optional()}).strict();
export async function POST(request:Request, context:{params:Promise<{relayId:string}>}) {try{
 sameOrigin(request); const user=await guest(); await rateLimit(`evolve:${user.id}`,30); const {relayId}=await context.params; const input=await body(request,schema);
 if(!z.string().uuid().safeParse(relayId).success)throw new ApiError('NOT_FOUND','Relay not found.',404);
 if(input.contextSource==='DETECTED'&&(!input.evidence||input.evidence.confidence<0.55)) throw new ApiError('INVALID_EVIDENCE','A detected object needs an allowlisted label and confidence.');
 const response=await transaction(async c=>{
  const prior=await c.query('SELECT response_json,operation,relay_id FROM mutation_requests WHERE guest_id=$1 AND request_id=$2',[user.id,input.requestId]); if(prior.rowCount){if(prior.rows[0].operation!=='EVOLVE'||prior.rows[0].relay_id!==relayId)throw new ApiError('IDEMPOTENCY_MISMATCH','Request ID was already used.',409);return prior.rows[0].response_json;}
  const q=await c.query('SELECT * FROM relays WHERE id=$1 FOR UPDATE',[relayId]); if(!q.rowCount)throw new ApiError('NOT_FOUND','Relay not found.',404); const r=q.rows[0];
  if(new Date(r.expires_at)<=new Date())throw new ApiError('RELAY_EXPIRED','This relay has expired.',410);
  if(r.current_holder_guest_id!==user.id)throw new ApiError('NOT_HOLDER','Milo is exploring with another friend.',403);
  if(r.status!=='HELD')throw new ApiError('INVITE_PENDING','Resolve the pending invitation before evolving.',409);
  if(r.version!==input.expectedVersion)throw new ApiError('VERSION_CONFLICT','Milo changed on another device. Refresh to continue.',409);
  if(r.last_evolution_turn>=r.turn_number)throw new ApiError('ALREADY_EVOLVED_THIS_TURN','Pass Milo to a friend before evolving again.',409);
  const part=await c.query('SELECT alias FROM relay_participants WHERE relay_id=$1 AND guest_id=$2',[relayId,user.id]); const alias=part.rows[0]?.alias??'Friend';
  const next=evolveCharacter({state:r.state_json,context:input.context as Context,interaction:input.interaction as Interaction,chapter:r.version+1,actorAlias:alias});
  const version=r.version+1; const event={sequence:version,actorAlias:alias,eventType:'EVOLVED',context:input.context,contextSource:input.contextSource,interaction:input.interaction,evidence:input.contextSource==='DETECTED'?input.evidence:null,delta:next.delta,state:next.nextState,narrative:next.narrative,createdAt:new Date().toISOString()};
  await c.query('UPDATE relays SET state_json=$1,version=$2,last_evolution_turn=turn_number,updated_at=now() WHERE id=$3',[next.nextState,version,relayId]);
  await c.query(`INSERT INTO relay_events(id,relay_id,sequence,actor_guest_id,actor_alias,event_type,context_type,context_source,interaction,evidence_json,delta_json,resulting_state_json,narrative) VALUES($1,$2,$3,$4,$5,'EVOLVED',$6,$7,$8,$9,$10,$11,$12)`,[randomUUID(),relayId,version,user.id,alias,input.context,input.contextSource,input.interaction,event.evidence,next.delta,next.nextState,next.narrative]);
  const out={relayId,version,state:next.nextState,event,permissions:{canEvolve:false,canInvite:true}}; await c.query("INSERT INTO mutation_requests(guest_id,request_id,relay_id,operation,response_json) VALUES($1,$2,$3,'EVOLVE',$4)",[user.id,input.requestId,relayId,out]); return out;
 }); return ok(response);
}catch(e){return fail(e);} }
