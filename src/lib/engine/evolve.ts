import { characterSchema, type CharacterState } from './schema';

export type Context = 'COFFEE'|'PLANT'|'BOOKS'|'TECH'|'NEUTRAL';
export type Interaction = 'EXPLORE'|'PLAY'|'REST';
const xpByAction: Record<Interaction, number> = { EXPLORE: 20, PLAY: 15, REST: 10 };
const story: Record<Context, string> = {
  COFFEE: 'discovered a cozy coffee break', PLANT: 'found a little garden', BOOKS: 'opened a brand new story',
  TECH: 'learned a clever new trick', NEUTRAL: 'collected a new memory'
};
export function evolveCharacter(input: { state: CharacterState; context: Context; interaction: Interaction; chapter: number; actorAlias: string }) {
  const { state, context, interaction, chapter } = input;
  const experience = Math.min(3000, state.experience + xpByAction[interaction]);
  const next = { ...state, experience, level: Math.min(99, 1 + Math.floor(experience / 30)),
    sizeScale: Math.min(1.4, 1 + Math.floor(experience / 30) * 0.025), lastContext: context,
    visitedContexts: [...new Set([...state.visitedContexts, context])],
    mood: (interaction === 'REST' ? 'sleepy' : context === 'PLANT' ? 'relaxed' : context === 'COFFEE' ? 'delighted' : 'curious') as CharacterState['mood'],
    leafCount: context === 'PLANT' ? Math.min(3, state.leafCount + 1) : state.leafCount,
    orbitingStars: context === 'BOOKS' ? Math.min(4, state.orbitingStars + 1) : state.orbitingStars,
    glasses: state.glasses || context === 'BOOKS', steamAura: state.steamAura || context === 'COFFEE',
    pixelAura: state.pixelAura || context === 'TECH', ribbonCount: context === 'NEUTRAL' ? Math.min(3, state.ribbonCount + 1) : state.ribbonCount,
    bodyHue: context === 'PLANT' ? 155 : context === 'COFFEE' ? 34 : state.bodyHue
  };
  const nextState = characterSchema.parse(next);
  const trait = context === 'PLANT' ? 'a mint leaf' : context === 'BOOKS' ? 'round glasses' : context === 'COFFEE' ? 'a warm steam glow' : context === 'TECH' ? 'a pixel aura' : 'a tiny ribbon';
  return { nextState, delta: { context, interaction, trait }, narrative: `${state.name} ${story[context]} with ${input.actorAlias} and gained ${trait}.`, effectKey: `${chapter}:${context}:${interaction}` };
}
