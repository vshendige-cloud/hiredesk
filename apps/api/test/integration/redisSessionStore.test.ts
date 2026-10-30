import { describe, expect, it } from 'vitest';
import { RedisSessionStore } from '../../src/auth/sessionStore.ts';

const url = process.env.TEST_REDIS_URL;

describe.skipIf(!url)('RedisSessionStore (requires TEST_REDIS_URL)', () => {
  it('stores, expires-by-TTL and destroys sessions', async () => {
    const store = new RedisSessionStore(url!, `hiredesk:test:${Date.now()}:`);
    const session = { staffId: 7, role: 'manager' as const, depotId: 2, createdAt: '2026-11-02T09:00:00Z' };
    const id = await store.create(session, 2);
    expect(await store.get(id)).toEqual(session);
    await store.destroy(id);
    expect(await store.get(id)).toBeNull();
    const short = await store.create(session, 1);
    await new Promise((r) => setTimeout(r, 1500));
    expect(await store.get(short)).toBeNull();
    await store.close();
  });
});
