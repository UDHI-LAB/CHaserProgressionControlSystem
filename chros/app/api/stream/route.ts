import type { ChrosEvent } from '@chros/shared';
import { buildSnapshot, nextEventId, replayAfter, subscribe } from '@/lib/broadcast';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** プロキシによるアイドル切断を防ぐコメント行の間隔。§6.1 */
const PING_INTERVAL_MS = 15_000;

function encodeEvent(id: number, event: ChrosEvent): string {
  return `id: ${id}\nevent: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`;
}

/**
 * GET /api/stream — 全 Viewer が購読する SSE ストリーム。§6.1
 * 旧 chros-websock (Express + socket.io) の置き換え。
 */
export function GET(request: Request): Response {
  const encoder = new TextEncoder();
  const lastEventIdHeader = request.headers.get('last-event-id');
  const lastEventId = lastEventIdHeader ? Number.parseInt(lastEventIdHeader, 10) : NaN;

  let unsubscribe: (() => void) | undefined;
  let ping: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      const send = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // 送信先が既に切れている。次の abort で後始末される。
          closed = true;
        }
      };

      // 再送可能なら差分だけ、無理なら全状態を送り直す。
      const replayed = Number.isNaN(lastEventId) ? null : replayAfter(lastEventId);
      if (replayed) {
        for (const entry of replayed) send(encodeEvent(entry.id, entry.event));
      } else {
        send(encodeEvent(nextEventId() - 1, { type: 'snapshot', payload: buildSnapshot() }));
      }

      unsubscribe = subscribe((entry) => send(encodeEvent(entry.id, entry.event)));
      ping = setInterval(() => send(': ping\n\n'), PING_INTERVAL_MS);

      request.signal.addEventListener('abort', () => {
        closed = true;
        unsubscribe?.();
        if (ping) clearInterval(ping);
        try {
          controller.close();
        } catch {
          // 既に閉じている
        }
      });
    },
    cancel() {
      unsubscribe?.();
      if (ping) clearInterval(ping);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // Nginx 等のバッファリングを止めないとイベントが溜まってから届く
      'X-Accel-Buffering': 'no',
    },
  });
}
