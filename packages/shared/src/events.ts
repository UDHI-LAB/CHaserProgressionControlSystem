import { z } from 'zod';
import {
  formatSchema,
  halfSchema,
  matchViewSchema,
  outputSlotSchema,
  participantViewSchema,
  screenIdSchema,
  sideSchema,
  slotValuesSchema,
  standingsSchema,
} from './domain';

/**
 * 接続直後に1件送る全状態。§6.2
 * Viewer が全画面を描くのに必要なものを漏れなく含む（§8.4）。
 */
export const snapshotSchema = z.object({
  screen: screenIdSchema,
  tournament: z.object({
    id: z.number().int(),
    name: z.string(),
    format: formatSchema,
  }),
  slots: z.array(outputSlotSchema),
  participants: z.array(participantViewSchema),
  matches: z.array(matchViewSchema),
  currentMatchId: z.number().int().nullable(),
  standings: standingsSchema.nullable(),
});
export type Snapshot = z.infer<typeof snapshotSchema>;

export const scorePayloadSchema = z.object({
  matchId: z.number().int(),
  half: halfSchema,
  cool: z.object({ participantId: z.number().int(), slotValues: slotValuesSchema }),
  hot: z.object({ participantId: z.number().int(), slotValues: slotValuesSchema }),
  put: sideSchema.nullable(),
  lostConnect: sideSchema.nullable(),
});
export type ScorePayload = z.infer<typeof scorePayloadSchema>;

export const matchResultPayloadSchema = z.object({
  matchId: z.number().int(),
  /** 仕切り直しに終わった場合は winnerId が null かつ replay が true。§5.5 */
  winnerId: z.number().int().nullable(),
  replay: z.boolean(),
  slotValues: z.record(z.string(), slotValuesSchema),
});
export type MatchResultPayload = z.infer<typeof matchResultPayloadSchema>;

export const chrosEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('snapshot'), payload: snapshotSchema }),
  z.object({ type: z.literal('screen.changed'), payload: z.object({ screen: screenIdSchema }) }),
  z.object({ type: z.literal('match.started'), payload: z.object({ matchId: z.number().int() }) }),
  z.object({ type: z.literal('match.scored'), payload: scorePayloadSchema }),
  z.object({ type: z.literal('match.finished'), payload: matchResultPayloadSchema }),
  z.object({ type: z.literal('standings.updated'), payload: standingsSchema }),
]);
export type ChrosEvent = z.infer<typeof chrosEventSchema>;

export type ChrosEventType = ChrosEvent['type'];
