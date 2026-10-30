import { describe, expect, it } from 'vitest';
import { quoteHire } from '../../src/domain/pricing.ts';

const rates = { dailyRatePence: 9500, weeklyRatePence: 38000 };
const period = (startDate: string, endDate: string) => ({ startDate, endDate });

describe('quoteHire', () => {
  it('charges the daily rate for short hires', () => {
    expect(quoteHire(period('2026-11-02', '2026-11-03'), rates)).toBe(19000);
  });
  it('caps a short hire at one weekly rate', () => {
    // 5 days x 9500 = 47500, capped at 38000
    expect(quoteHire(period('2026-11-02', '2026-11-06'), rates)).toBe(38000);
  });
  it('charges exactly one weekly rate for seven days', () => {
    expect(quoteHire(period('2026-11-02', '2026-11-08'), rates)).toBe(38000);
  });
  it('adds daily charges after a full week', () => {
    // 8 days: 1 week + 1 day
    expect(quoteHire(period('2026-11-02', '2026-11-09'), rates)).toBe(47500);
  });
  it('rejects non-integer or non-positive rates', () => {
    expect(() =>
      quoteHire(period('2026-11-02', '2026-11-02'), { dailyRatePence: 95.5, weeklyRatePence: 380 }),
    ).toThrow();
    expect(() => quoteHire(period('2026-11-02', '2026-11-02'), { dailyRatePence: 0, weeklyRatePence: 380 })).toThrow();
  });
});
