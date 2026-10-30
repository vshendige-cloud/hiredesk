import { describe, expect, it } from 'vitest';
import { hireDays, periodsOverlap } from '../../src/domain/period.ts';

describe('hireDays', () => {
  it('counts a same-day hire as one day', () => {
    expect(hireDays({ startDate: '2026-11-02', endDate: '2026-11-02' })).toBe(1);
  });
  it('counts both start and end dates', () => {
    expect(hireDays({ startDate: '2026-11-02', endDate: '2026-11-08' })).toBe(7);
  });
  it('is unaffected by the UK clock change on 25 October 2026', () => {
    expect(hireDays({ startDate: '2026-10-24', endDate: '2026-10-26' })).toBe(3);
  });
  it('rejects an end date before the start date', () => {
    expect(() => hireDays({ startDate: '2026-11-08', endDate: '2026-11-02' })).toThrow();
  });
  it('rejects impossible calendar dates', () => {
    expect(() => hireDays({ startDate: '2026-02-30', endDate: '2026-03-02' })).toThrow();
  });
});

describe('periodsOverlap', () => {
  const a = { startDate: '2026-11-02', endDate: '2026-11-05' };
  it('detects a shared boundary day (inclusive periods)', () => {
    expect(periodsOverlap(a, { startDate: '2026-11-05', endDate: '2026-11-07' })).toBe(true);
  });
  it('allows back-to-back periods', () => {
    expect(periodsOverlap(a, { startDate: '2026-11-06', endDate: '2026-11-07' })).toBe(false);
  });
  it('detects containment', () => {
    expect(periodsOverlap(a, { startDate: '2026-11-03', endDate: '2026-11-04' })).toBe(true);
  });
});
