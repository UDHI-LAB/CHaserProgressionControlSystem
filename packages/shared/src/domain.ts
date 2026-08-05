import { z } from 'zod';

/** 配信用 Viewer が表示しうる画面。§8.1 */
export const screenIdSchema = z.enum([
  'next-game',
  'in-game',
  'result',
  'standings',
  'bracket',
  'intermission',
]);
export type ScreenId = z.infer<typeof screenIdSchema>;

/** 大会形式。予選総当たり → 決勝トーナメントの接続方法は §11.2 で未決。 */
export const formatSchema = z.enum(['round-robin', 'single-elimination']);
export type Format = z.infer<typeof formatSchema>;

export const sideSchema = z.enum(['COOL', 'HOT']);
export type Side = z.infer<typeof sideSchema>;

export const halfSchema = z.enum(['FIRST', 'SECOND']);
export type Half = z.infer<typeof halfSchema>;

export const matchStateSchema = z.enum(['pending', 'running', 'finished', 'replay']);
export type MatchState = z.infer<typeof matchStateSchema>;

/**
 * 出力スロットの定義。§8.2
 * Viewer はスコアの意味を知らず、この定義に従って描画する。
 * 計算規則（§5, トラックB）が確定するまでは `{ name: 'score' }` 1つのダミーを流す。
 */
export const outputSlotSchema = z.object({
  name: z.string(),
  label: z.string(),
});
export type OutputSlot = z.infer<typeof outputSlotSchema>;

export const participantViewSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});
export type ParticipantView = z.infer<typeof participantViewSchema>;

/** スロット名 → 値。中身の意味は ScoreRule 側が決める。 */
export const slotValuesSchema = z.record(z.string(), z.number());
export type SlotValues = z.infer<typeof slotValuesSchema>;

export const matchViewSchema = z.object({
  id: z.number().int(),
  name: z.string().nullable(),
  state: matchStateSchema,
  agent1: participantViewSchema,
  agent2: participantViewSchema,
  winnerId: z.number().int().nullable(),
  /** 確定済みハーフの集計結果。参加者 id → スロット値 */
  slotValues: z.record(z.string(), slotValuesSchema).default({}),
});
export type MatchView = z.infer<typeof matchViewSchema>;

export const standingsSchema = z.object({
  rows: z.array(
    z.object({
      rank: z.number().int(),
      participant: participantViewSchema,
      slotValues: slotValuesSchema,
    }),
  ),
});
export type Standings = z.infer<typeof standingsSchema>;
