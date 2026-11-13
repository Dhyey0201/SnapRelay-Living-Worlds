import { test,expect,type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test('shows the 2D Milo fallback when WebGL cannot initialize',async({page})=>{
 await page.addInitScript(()=>{
  const original=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,contextType:string,...args:unknown[]){
   if(contextType==='webgl2'||contextType==='webgl')return null;
   return Reflect.apply(original,this,[contextType,...args]);
  } as typeof HTMLCanvasElement.prototype.getContext;
 });
 await page.goto('/');
 await expect(page.getByRole('img',{name:'Milo, level 1 character preview'})).toBeVisible();
 await expect(page.getByText('2D PREVIEW · WEBGL UNAVAILABLE')).toBeVisible();
});

test('two independent guests evolve and transfer the same relay',async({browser})=>{
 const a=await browser.newContext();const b=await browser.newContext();const first=await a.newPage();const second=await b.newPage();
 await first.addInitScript(()=>Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:()=>Promise.reject(new DOMException('Permission denied','NotAllowedError'))}}));
 await first.goto('/create');await first.getByRole('button',{name:/Bring Milo to Life/}).click();await expect(first).toHaveURL(/\/r\//);await expect(first.getByText(/Chosen by you · manual context/)).toBeVisible();
 await first.getByRole('button',{name:/Try camera/}).click();await expect(first.getByText('Camera access was unavailable. The illustrated scene is still ready.')).toBeVisible();
 await first.getByRole('button',{name:/Evolve Milo/}).click();await expect(first.getByText(/is ready to travel/)).toBeVisible({timeout:5000});await first.getByRole('button',{name:/Pass to a friend/}).click();
 const invite=await first.getByRole('textbox',{name:'Invitation link'}).inputValue();expect(invite).toContain('/join#t=');const token=new URL(invite).hash.slice(3);
 await second.goto(invite);await expect(second.getByRole('heading',{name:'Meet Milo.'})).toBeVisible();await second.getByLabel(/WHAT SHOULD MILO CALL YOU/).fill('Priya');await second.getByRole('button',{name:/Accept relay/}).click();await expect(second).toHaveURL(/\/r\//);await second.getByRole('button',{name:'Plant'}).click();const duplicate=await second.evaluate(async()=>{const id=location.pathname.split('/')[2];const before=await fetch(`/api/relays/${id}`).then(r=>r.json());const request={requestId:crypto.randomUUID(),expectedVersion:before.data.version,interaction:'EXPLORE',context:'PLANT',contextSource:'MANUAL'};const send=()=>fetch(`/api/relays/${id}/evolve`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(request)});const one=await send();const two=await send();const after=await fetch(`/api/relays/${id}`).then(r=>r.json());return {first:one.status,second:two.status,leaves:after.data.state.leafCount,chapters:after.data.eventCount-before.data.eventCount};});expect(duplicate).toEqual({first:200,second:200,leaves:1,chapters:1});await expect(second.getByText(/is ready to travel/)).toBeVisible({timeout:5000});
 const third=await browser.newPage();await third.goto('/');const replay=await third.evaluate(async({token,requestId})=>{const r=await fetch('/api/invites/claim',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token,alias:'Alex',requestId})});return {status:r.status,body:await r.json()};},{token,requestId:randomUUID()});expect(replay.status).toBe(409);expect(replay.body.error.code).toBe('INVITE_ALREADY_USED');await third.close();
 await first.reload();await expect(first.getByText(/Milo is exploring with a friend/)).toBeVisible();await expect(first.getByText('WITH PRIYA')).toBeVisible();const checks=await first.evaluate(async()=>{const relayId=location.pathname.split('/')[2];const current=await fetch(`/api/relays/${relayId}`).then(r=>r.json());const blocked=await fetch(`/api/relays/${relayId}/evolve`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requestId:crypto.randomUUID(),expectedVersion:current.data.version,interaction:'EXPLORE',context:'COFFEE',contextSource:'MANUAL'})});const events=await fetch(`/api/relays/${relayId}/events`);return {blockedStatus:blocked.status,eventsStatus:events.status,events:await events.json()};});expect(checks.blockedStatus).toBe(403);expect(checks.eventsStatus).toBe(200);expect(checks.events.data).toHaveLength(5);await first.getByRole('link',{name:/Journey/}).click();await expect(first.getByText('Milo found a little garden with Priya and gained a mint leaf.')).toBeVisible();
 await a.close();await b.close();
});

test('simultaneous claims produce one holder and one transfer event',async({browser})=>{
 const owner=await browser.newContext();const firstGuest=await browser.newContext();const secondGuest=await browser.newContext();
 const a=await owner.newPage();await a.goto('/create');await a.getByRole('button',{name:/Bring Milo to Life/}).click();
 await a.getByRole('button',{name:/Evolve Milo/}).click();await expect(a.getByText(/is ready to travel/)).toBeVisible();await a.getByRole('button',{name:/Pass to a friend/}).click();
 const link=await a.getByRole('textbox',{name:'Invitation link'}).inputValue();const token=new URL(link).hash.slice(3);
 const b=await firstGuest.newPage();const c=await secondGuest.newPage();await Promise.all([b.goto('/'),c.goto('/')]);
 const contenders:{page:Page;alias:string}[]=[{page:b,alias:'Priya'},{page:c,alias:'Alex'}];
 const claims=await Promise.all(contenders.map(({page,alias})=>page.evaluate(async({token,alias,requestId}:{token:string;alias:string;requestId:string})=>{const r=await fetch('/api/invites/claim',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token,alias,requestId})});return {status:r.status,body:await r.json()};},{token,alias,requestId:randomUUID()})));
 expect(claims.map((result:{status:number})=>result.status).sort()).toEqual([200,409]);
 const events=await a.evaluate(async()=>{const id=location.pathname.split('/')[2];const r=await fetch(`/api/relays/${id}/events`);return r.json();});
 expect(events.data.filter((event:{eventType:string})=>event.eventType==='TRANSFERRED')).toHaveLength(1);
 await owner.close();await firstGuest.close();await secondGuest.close();
});
