import { apiError, changeScreenRequestSchema } from '@chros/shared';
import { broadcast, getCurrentScreen } from '@/lib/broadcast';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/screen — 現在の配信画面。 */
export function GET(): Response {
  return Response.json({ screen: getCurrentScreen() });
}

/**
 * POST /api/screen — 配信画面の切り替え。§7
 * 旧 chros-websock の POST /api/change-screen の置き換え。
 */
export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(apiError('invalid_json', 'リクエストボディが JSON ではありません'), {
      status: 400,
    });
  }

  const parsed = changeScreenRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(apiError('invalid_request', parsed.error.issues[0]?.message ?? '不正なリクエストです'), {
      status: 400,
    });
  }

  broadcast({ type: 'screen.changed', payload: { screen: parsed.data.screen } });

  return Response.json({ screen: parsed.data.screen });
}
