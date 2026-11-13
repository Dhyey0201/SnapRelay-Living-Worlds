import { z } from 'zod';

export const contexts = ['COFFEE','PLANT','BOOKS','TECH','NEUTRAL'] as const;
export const interactions = ['EXPLORE','PLAY','REST'] as const;
export const contextSchema = z.enum(contexts);
export const characterSchema = z.object({
  schemaVersion: z.literal(1), name: z.string().min(1).max(24), level: z.number().int().min(1).max(99),
  experience: z.number().int().min(0).max(3000), bodyHue: z.number().min(0).max(360), sizeScale: z.number().min(0.8).max(1.4),
  mood: z.enum(['curious','delighted','sleepy','relaxed']), leafCount: z.number().int().min(0).max(3),
  orbitingStars: z.number().int().min(0).max(4), glasses: z.boolean(), steamAura: z.boolean(), pixelAura: z.boolean(), ribbonCount: z.number().int().min(0).max(3),
  visitedContexts: z.array(contextSchema).max(5), lastContext: contextSchema
});
export type CharacterState = z.infer<typeof characterSchema>;
export const initialState = (name: string, palette: string): CharacterState => characterSchema.parse({
  schemaVersion: 1, name, level: 1, experience: 0, bodyHue: palette === 'MINT' ? 152 : palette === 'SUNSET' ? 28 : 252,
  sizeScale: 1, mood: 'curious', leafCount: 0, orbitingStars: 0, glasses: false, steamAura: false, pixelAura: false, ribbonCount: 0, visitedContexts: [], lastContext: 'NEUTRAL'
});
