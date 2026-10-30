import { hireDays, type HirePeriod } from './period.ts';

export interface RateCard {
  dailyRatePence: number;
  weeklyRatePence: number;
}

/**
 * Hire price in pence (integer minor units; never floating-point money).
 *
 * Rules (from the depot rate card):
 *  - Each full 7-day block is charged at the weekly rate.
 *  - Remaining days are charged at the daily rate, but never more than one weekly rate.
 */
export function quoteHire(period: HirePeriod, rates: RateCard): number {
  assertRate(rates.dailyRatePence, 'dailyRatePence');
  assertRate(rates.weeklyRatePence, 'weeklyRatePence');
  const days = hireDays(period);
  const fullWeeks = Math.floor(days / 7);
  const extraDays = days % 7;
  const extraCost = Math.min(extraDays * rates.dailyRatePence, rates.weeklyRatePence);
  return fullWeeks * rates.weeklyRatePence + extraCost;
}

function assertRate(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer number of pence`);
  }
}
