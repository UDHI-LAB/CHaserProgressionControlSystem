'use server';

import { changeScreenRequestSchema, type ScreenId } from '@chros/shared';
import { broadcast } from '@/lib/broadcast';

/**
 * 配信画面を切り替える。§3.2 のとおり Console の操作は Server Actions を基本とする。
 * 将来 DB に進行状態を持たせた際も、書き込みとブロードキャストはこの関数内で完結させる（§7 規約）。
 */
export async function changeScreen(screen: ScreenId): Promise<void> {
  const parsed = changeScreenRequestSchema.parse({ screen });
  broadcast({ type: 'screen.changed', payload: { screen: parsed.screen } });
}
