import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { setupTestApp } from './helpers.ts';

let ctx: Awaited<ReturnType<typeof setupTestApp>>;
let cookie: string;
beforeAll(async () => {
  ctx = await setupTestApp();
  cookie = await ctx.login();
});
afterAll(async () => ctx.teardown());

const book = (startDate: string, endDate: string) =>
  ctx.app.inject({
    method: 'POST',
    url: '/bookings',
    headers: { cookie },
    payload: {
      equipmentId: ctx.equipmentId,
      customerEmail: 'Builder@Example.com',
      customerName: 'A. Builder',
      startDate,
      endDate,
    },
  });

describe('bookings', () => {
  it('creates a booking with a server-calculated price', async () => {
    const res = await book('2026-11-02', '2026-11-03');
    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({
      status: 'reserved',
      total_pence: 19000,
      start_date: '2026-11-02',
      end_date: '2026-11-03',
    });
  });

  it('rejects an overlapping booking with 409', async () => {
    const res = await book('2026-11-03', '2026-11-04');
    expect(res.statusCode).toBe(409);
  });

  it('allows a back-to-back booking', async () => {
    const res = await book('2026-11-04', '2026-11-04');
    expect(res.statusCode).toBe(201);
  });

  it('frees availability when a booking is cancelled', async () => {
    const created = await book('2026-12-01', '2026-12-03');
    const id = created.json().id as number;
    const before = await ctx.app.inject({
      method: 'GET',
      url: `/equipment/${ctx.equipmentId}/availability?from=2026-12-02&to=2026-12-02`,
      headers: { cookie },
    });
    expect(before.json().available).toBe(false);
    const cancel = await ctx.app.inject({ method: 'POST', url: `/bookings/${id}/cancel`, headers: { cookie } });
    expect(cancel.json().status).toBe('cancelled');
    const after = await ctx.app.inject({
      method: 'GET',
      url: `/equipment/${ctx.equipmentId}/availability?from=2026-12-02&to=2026-12-02`,
      headers: { cookie },
    });
    expect(after.json().available).toBe(true);
  });

  it('validates input with 400', async () => {
    const res = await book('2026-11-10', 'tomorrow');
    expect(res.statusCode).toBe(400);
  });

  it('rejects an end date before the start date with 400', async () => {
    const res = await book('2026-11-10', '2026-11-09');
    expect(res.statusCode).toBe(400);
  });

  it('returns 404 for unknown equipment', async () => {
    const res = await ctx.app.inject({
      method: 'POST',
      url: '/bookings',
      headers: { cookie },
      payload: {
        equipmentId: 99999,
        customerEmail: 'a@example.com',
        customerName: 'A',
        startDate: '2026-11-10',
        endDate: '2026-11-10',
      },
    });
    expect(res.statusCode).toBe(404);
  });
});
