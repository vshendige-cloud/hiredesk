/** A hire period of whole calendar days. Both dates are inclusive. */
export interface HirePeriod {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toUtcMidnight(isoDate: string): number {
  const parts = isoDate.split('-').map(Number);
  const [y, m, d] = parts;
  if (parts.length !== 3 || !y || !m || !d) throw new Error(`Invalid date: ${isoDate}`);
  const ms = Date.UTC(y, m - 1, d);
  // Reject impossible dates such as 2026-02-30, which Date.UTC would silently roll over.
  if (new Date(ms).toISOString().slice(0, 10) !== isoDate) throw new Error(`Invalid date: ${isoDate}`);
  return ms;
}

/** Number of hire days, counting both the start and end date. */
export function hireDays(period: HirePeriod): number {
  const days = (toUtcMidnight(period.endDate) - toUtcMidnight(period.startDate)) / MS_PER_DAY + 1;
  if (days < 1) throw new Error('endDate must not be before startDate');
  return days;
}

/** True when two inclusive periods share at least one day. */
export function periodsOverlap(a: HirePeriod, b: HirePeriod): boolean {
  return a.startDate <= b.endDate && b.startDate <= a.endDate;
}
