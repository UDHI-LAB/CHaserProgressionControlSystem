'use client';

import { useState, useTransition } from 'react';
import type { ScreenId } from '@chros/shared';
import { changeScreen } from '../actions';

const options: { label: string; value: ScreenId }[] = [
  { label: '次の対戦（next-game）', value: 'next-game' },
  { label: '対戦中（in-game）', value: 'in-game' },
  { label: '結果（result）', value: 'result' },
  { label: '順位表（standings）', value: 'standings' },
  { label: '対戦表（bracket）', value: 'bracket' },
  { label: '休憩中（intermission）', value: 'intermission' },
];

export default function NextDisplayControl() {
  const [selected, setSelected] = useState<ScreenId>('next-game');
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2 text-gray-800">
      {/* ダミー用ビジュアルボックス */}
      <div className="bg-gray-200 h-32 rounded" />

      <label className="text-sm font-semibold mt-2">表示画面選択</label>
      <select
        className="border border-gray-400 rounded px-3 py-2 text-gray-900 bg-white focus:outline-none"
        value={selected}
        onChange={(e) => setSelected(e.target.value as ScreenId)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => changeScreen(selected))}
        className="mt-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded"
      >
        {pending ? '切り替え中…' : '変更'}
      </button>
    </div>
  );
}
