import { describe, expect, it } from 'vitest';
import { MemorySessionStore } from '../../src/auth/sessionStore.ts';

const session = { staffId: 1, role: 'staff' as const, depotId: 1, createdAt: '2026-11-02T09:00:00Z' };

describe('MemorySessionStore', () => {
  it('expires sessions after the TTL', async () => {
    let now = 0;
    const store = new MemorySessionStore(() => now);
    const id = await store.create(session, 60);
    expect(await store.get(id)).toEqual(session);
    now = 61_000;
    expect(await store.get(id)).toBeNull();
  });
  it('extends expiry on touch (sliding sessions)', async () => {
    let now = 0;
    const store = new MemorySessionStore(() => now);
    const id = await store.create(session, 60);
    now = 50_000;
    await store.touch(id, 60);
    now = 100_000;
    expect(await store.get(id)).toEqual(session);
  });
});
