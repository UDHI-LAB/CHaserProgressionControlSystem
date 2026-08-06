import { describe, expect, it } from 'vitest';
import { aggregateMatch, evaluateHalf } from './index';

describe('evaluateHalf', () => {
  it('素点をそのまま score スロットに置く', () => {
    expect(evaluateHalf({ rawScore: 12 })).toEqual({ score: 12 });
  });
});

describe('aggregateMatch', () => {
  it('ハーフごとのスロット値をスロット名で合算する', () => {
    expect(aggregateMatch([{ score: 3 }, { score: 4 }])).toEqual({ score: 7 });
  });

  it('一方にしか現れないスロットも欠落させない', () => {
    expect(aggregateMatch([{ score: 3 }, { score: 1, bonus: 2 }])).toEqual({ score: 4, bonus: 2 });
  });

  it('ハーフが無ければ空を返す', () => {
    expect(aggregateMatch([])).toEqual({});
  });
});
