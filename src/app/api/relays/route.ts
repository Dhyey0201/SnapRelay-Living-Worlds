import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { guest } from '@/lib/auth';
import { body, fail, ok, rateLimit, sameOrigin } from '@/lib/api';
import { transaction } from '@/lib/db';
import { initialState } from '@/lib/engine/schema';
const schema = z.object({ name: z.string().trim().min(1).max(24), personality: z.enum(['CURIOUS','PLAYFUL','CALM']), palette: z.enum(['LAVENDER','MINT','SUNSET']), alias: z.string().trim().min(1).max(24) }).strict();
export async function POST(request: Request) { try {
  sameOrigin(request); const user = await guest(); await rateLimit(`create:${user.id}`, 10); const input = await body(request, schema);
  const result = await transaction(async client => {
    const id = randomUUID(); const state = initialState(input.name, input.palette);
    await client.query(`INSERT INTO relays(id,creator_guest_id,current_holder_guest_id,name,personality,palette,state_json) VALUES($1,$2,$2,$3,$4,$5,$6)`, [id,user.id,input.name,input.personality,input.palette,state]);
    await client.query('INSERT INTO relay_participants(relay_id,guest_id,alias) VALUES($1,$2,$3)', [id,user.id,input.alias]);
    await client.query(`INSERT INTO relay_events(id,relay_id,sequence,actor_guest_id,actor_alias,event_type,resulting_state_json,narrative) VALUES($1,$2,1,$3,$4,'CREATED',$5,$6)`, [randomUUID(),id,user.id,input.alias,state,`${input.name} came to life with ${input.alias}.`]);
    return { relayId:id, version:1, state, permissions:{canEvolve:true,canInvite:false}, createdAt:new Date().toISOString() };
  }); return ok(result, 201);
} catch (e) { return fail(e); } }
