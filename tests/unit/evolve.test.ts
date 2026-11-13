import { describe,expect,it } from 'vitest';
import { evolveCharacter } from '../../src/lib/engine/evolve';
import { characterSchema, initialState } from '../../src/lib/engine/schema';
const state=initialState('Milo','LAVENDER');
describe('deterministic character evolution',()=>{
 it('adds a bounded leaf and records a manual plant context',()=>{const r=evolveCharacter({state,context:'PLANT',interaction:'EXPLORE',chapter:2,actorAlias:'Priya'});expect(r.nextState.leafCount).toBe(1);expect(r.nextState.visitedContexts).toEqual(['PLANT']);expect(r.narrative).toContain('Priya');});
 it.each([['COFFEE','steamAura'],['PLANT','leafCount'],['BOOKS','glasses'],['TECH','pixelAura'],['NEUTRAL','ribbonCount']] as const)('applies %s visible trait', (context,trait)=>{const result=evolveCharacter({state,context,interaction:'PLAY',chapter:2,actorAlias:'You'});expect(result.nextState[trait]).toBe(trait==='leafCount'||trait==='ribbonCount'?1:true);});
 it('is byte-for-byte deterministic and preserves prior traits',()=>{const coffee=evolveCharacter({state,context:'COFFEE',interaction:'EXPLORE',chapter:2,actorAlias:'You'}).nextState;const input={state:coffee,context:'PLANT' as const,interaction:'REST' as const,chapter:3,actorAlias:'Friend'};expect(JSON.stringify(evolveCharacter(input))).toBe(JSON.stringify(evolveCharacter(input)));const plant=evolveCharacter(input).nextState;expect(plant.steamAura).toBe(true);expect(plant.leafCount).toBe(1);expect(plant.visitedContexts).toEqual(['COFFEE','PLANT']);expect(plant.mood).toBe('sleepy');});
 it('caps leaf growth',()=>{let current=state;for(let i=0;i<6;i++)current=evolveCharacter({state:current,context:'PLANT',interaction:'REST',chapter:i+2,actorAlias:'You'}).nextState;expect(current.leafCount).toBe(3);});
 it('rejects malformed canonical state and out-of-range trait counts',()=>{expect(characterSchema.safeParse({...state,name:'x'.repeat(25)}).success).toBe(false);expect(characterSchema.safeParse({...state,leafCount:4}).success).toBe(false);expect(characterSchema.safeParse({...state,mood:'angry'}).success).toBe(false);});
});
