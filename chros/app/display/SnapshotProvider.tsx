'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ChrosEvent, ScreenId, Snapshot } from '@chros/shared';

const SnapshotContext = createContext<Snapshot | null>(null);

/**
 * Viewer の全状態。SSE のスナップショットが届くまでは null。
 * §6.4 のとおり、切断中も直前の状態を保持し、画面を白くしない。
 */
export function useSnapshot(): Snapshot | null {
  return useContext(SnapshotContext);
}

export function useScreen(): ScreenId | null {
  return useSnapshot()?.screen ?? null;
}

function reduce(current: Snapshot | null, event: ChrosEvent): Snapshot | null {
  switch (event.type) {
    case 'snapshot':
      return event.payload;
    case 'screen.changed':
      return current ? { ...current, screen: event.payload.screen } : current;
    case 'match.started':
      return current ? { ...current, currentMatchId: event.payload.matchId } : current;
    case 'standings.updated':
      return current ? { ...current, standings: event.payload } : current;
    // match.scored / match.finished の反映は対戦のドメインモデル（§4）確定後に実装する。
    default:
      return current;
  }
}

/**
 * SSE (`EventSource`) で状態に追従する。§3.2
 * EventSource は自動再接続し、`Last-Event-ID` の送出もブラウザが行うため、
 * 再接続時の取りこぼし復帰はサーバー側（/api/stream）だけで完結する。
 */
export default function SnapshotProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? '';
    const source = new EventSource(`${base}/api/stream`);

    const types = [
      'snapshot',
      'screen.changed',
      'match.started',
      'match.scored',
      'match.finished',
      'standings.updated',
    ] as const;

    const handlers = types.map((type) => {
      const handler = (message: MessageEvent<string>) => {
        const event = { type, payload: JSON.parse(message.data) } as ChrosEvent;
        setSnapshot((current) => reduce(current, event));
      };
      source.addEventListener(type, handler);
      return [type, handler] as const;
    });

    // 異常は配信に出さず、Console 側にだけ通知する（§6.4）。ここでは記録に留める。
    source.onerror = () => {
      console.warn('[display] SSE disconnected; retrying');
    };

    return () => {
      for (const [type, handler] of handlers) source.removeEventListener(type, handler);
      source.close();
    };
  }, []);

  return <SnapshotContext.Provider value={snapshot}>{children}</SnapshotContext.Provider>;
}
