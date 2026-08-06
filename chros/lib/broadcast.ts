import 'server-only';
import { EventEmitter } from 'node:events';
import type { ChrosEvent, ScreenId, Snapshot } from '@chros/shared';
import { DUMMY_SLOTS } from '@chros/scoring';

/**
 * SSE の配信バス。§6.3
 * Next.js が単一プロセスで動く限り、インメモリの EventEmitter で足りる。
 * 複数インスタンスが必要になった場合のみ PostgreSQL の LISTEN/NOTIFY を挟む。
 */

/** 再送に使う直近イベントの保持数。これを超えて遡る要求にはスナップショットを送り直す。 */
const REPLAY_BUFFER_SIZE = 256;

export type SequencedEvent = { id: number; event: ChrosEvent };

type Bus = {
  emitter: EventEmitter;
  buffer: SequencedEvent[];
  lastId: number;
  /** 現在の配信状態。DB のドメインモデル（§4）が入るまでの暫定の置き場。 */
  screen: ScreenId;
};

// 開発時の HMR でバスが作り直されると購読者が孤児になるため、グローバルに退避する。
const globalForBus = globalThis as unknown as { __chrosBus?: Bus };

const bus: Bus = (globalForBus.__chrosBus ??= {
  emitter: new EventEmitter(),
  buffer: [],
  lastId: 0,
  screen: 'next-game',
});

bus.emitter.setMaxListeners(0);

const CHANNEL = 'chros';

export function getCurrentScreen(): ScreenId {
  return bus.screen;
}

/**
 * 現在の完全な状態。接続直後に1件送る（§6.1）ので、Viewer は別 API を叩かなくてよい。
 *
 * 進行まわりの Prisma スキーマ（§4）は未着手のため、いまは静的な内容を返す。
 * DB が入った時点でここだけが差し替わり、`Snapshot` 型と Viewer は変わらない。
 */
export function buildSnapshot(): Snapshot {
  return {
    screen: bus.screen,
    tournament: { id: 1, name: 'CHaser 釧路大会', format: 'round-robin' },
    slots: DUMMY_SLOTS,
    participants: [],
    matches: [],
    currentMatchId: null,
    standings: null,
  };
}

/**
 * イベントを全購読者に配る。状態を変える操作は DB 書き込みとこの呼び出しを
 * 同一の関数内で行うこと（§7 規約）。片方だけ実行される経路を作らない。
 */
export function broadcast(event: ChrosEvent): SequencedEvent {
  if (event.type === 'screen.changed') {
    bus.screen = event.payload.screen;
  }

  const sequenced: SequencedEvent = { id: ++bus.lastId, event };

  bus.buffer.push(sequenced);
  if (bus.buffer.length > REPLAY_BUFFER_SIZE) {
    bus.buffer.splice(0, bus.buffer.length - REPLAY_BUFFER_SIZE);
  }

  bus.emitter.emit(CHANNEL, sequenced);
  return sequenced;
}

export function subscribe(listener: (event: SequencedEvent) => void): () => void {
  bus.emitter.on(CHANNEL, listener);
  return () => bus.emitter.off(CHANNEL, listener);
}

/**
 * `Last-Event-ID` からの再送分を返す。遡れないほど古い場合は null を返し、
 * 呼び出し側はスナップショットを送り直す（§6.1）。
 */
export function replayAfter(lastEventId: number): SequencedEvent[] | null {
  // 追いついている
  if (lastEventId === bus.lastId) return [];
  // サーバー再起動などで採番がリセットされ、クライアントが先の id を持っている。
  // 差分では整合が取れないのでスナップショットを送り直させる。
  if (lastEventId > bus.lastId) return null;

  const oldest = bus.buffer[0];
  if (!oldest || oldest.id > lastEventId + 1) return null;

  return bus.buffer.filter((entry) => entry.id > lastEventId);
}

export function nextEventId(): number {
  return bus.lastId + 1;
}
