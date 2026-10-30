import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { setupTestApp } from './helpers.ts';

let ctx: Awaited<ReturnType<typeof setupTestApp>>;
beforeAll(async () => {
  ctx = await setupTestApp();
});
afterAll(async () => ctx.teardown());

describe('legacy session authentication', () => {
  it('rejects unauthenticated requests with 401', async () => {
    const res = await ctx.app.inject({ method: 'GET', url: '/equipment' });
    expect(res.statusCode).toBe(401);
  });

  it('rejects a wrong password without revealing whether the user exists', async () => {
    const wrong = await ctx.app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'counter@man.hiredesk.example', password: 'nope' },
    });
    const unknown = await ctx.app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'nobody@hiredesk.example', password: 'nope' },
    });
    expect(wrong.statusCode).toBe(401);
    expect(unknown.statusCode).toBe(401);
    expect(wrong.json()).toEqual(unknown.json());
  });

  it('sets an httpOnly session cookie on login and accepts it', async () => {
    const res = await ctx.app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'counter@man.hiredesk.example', password: ctx.password },
    });
    expect(res.statusCode).toBe(200);
    const cookie = res.cookies.find((c) => c.name === 'hd_sid');
    expect(cookie?.httpOnly).toBe(true);
    const list = await ctx.app.inject({
      method: 'GET',
      url: '/equipment',
      headers: { cookie: `hd_sid=${cookie!.value}` },
    });
    expect(list.statusCode).toBe(200);
  });

  it('invalidates the session on logout', async () => {
    const cookie = await ctx.login();
    await ctx.app.inject({ method: 'POST', url: '/auth/logout', headers: { cookie } });
    const res = await ctx.app.inject({ method: 'GET', url: '/equipment', headers: { cookie } });
    expect(res.statusCode).toBe(401);
  });
});
