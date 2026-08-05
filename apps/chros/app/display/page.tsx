'use client';

import { useSnapshot } from './SnapshotProvider';

/**
 * 配信用 Viewer。画面の切り替えはルーティングではなく状態で行う（§10）。
 * `router.push` を使うと切り替えのたびに白画面と再接続が挟まるため、
 * 単一のルートに留まったまま描画内容だけを差し替える。
 *
 * 各画面の中身（§8.1）は進行まわりのドメインモデル確定後に実装する。
 * ここでは screen に対応する枠だけを置く。
 */
export default function DisplayPage() {
  const snapshot = useSnapshot();

  // 初回スナップショット到着前。§6.4 によりスピナーは出さず、黒のまま待つ。
  if (!snapshot) return <div className="h-screen w-screen bg-black" />;

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-black text-white">
      <p className="text-sm tracking-widest text-gray-400">{snapshot.tournament.name}</p>
      <h1 className="mt-4 text-6xl font-bold">{screenLabel(snapshot.screen)}</h1>
    </div>
  );
}

function screenLabel(screen: string): string {
  switch (screen) {
    case 'next-game':
      return '次の対戦';
    case 'in-game':
      return '対戦中';
    case 'result':
      return '結果';
    case 'standings':
      return '順位表';
    case 'bracket':
      return '対戦表';
    case 'intermission':
      return '休憩中';
    default:
      return screen;
  }
}
