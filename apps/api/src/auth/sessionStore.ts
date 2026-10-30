import { randomBytes } from 'node:crypto';
import { Redis } from 'ioredis';

export interface StaffSession {
  staffId: number;
  role: 'staff' | 'manager';
  depotId: number;
  createdAt: string;
}

/**
 * Legacy server-side session store. Sessions are opaque random IDs held in a cookie.
 * Chapter 1 introduces, and Chapter 8 carries out, the move to short-lived access
 * tokens with refresh rotation.
 */
export interface SessionStore {
  create(session: StaffSession, ttlSeconds: number): Promise<string>;
  get(id: string): Promise<StaffSession | null>;
  touch(id: string, ttlSeconds: number): Promise<void>;
  destroy(id: string): Promise<void>;
  close(): Promise<void>;
}

const newSessionId = () => randomBytes(32).toString('base64url');

/** For local development and tests only. Not shared between processes. */
export class MemorySessionStore implements SessionStore {
  private readonly items = new Map<string, { session: StaffSession; expiresAt: number }>();
  constructor(private readonly now: () => number = Date.now) {}

  async create(session: StaffSession, ttlSeconds: number) {
    const id = newSessionId();
    this.items.set(id, { session, expiresAt: this.now() + ttlSeconds * 1000 });
    return id;
  }
  async get(id: string) {
    const item = this.items.get(id);
    if (!item) return null;
    if (item.expiresAt <= this.now()) {
      this.items.delete(id);
      return null;
    }
    return item.session;
  }
  async touch(id: string, ttlSeconds: number) {
    const item = this.items.get(id);
    if (item) item.expiresAt = this.now() + ttlSeconds * 1000;
  }
  async destroy(id: string) {
    this.items.delete(id);
  }
  async close() {}
}

export class RedisSessionStore implements SessionStore {
  private readonly redis: Redis;
  constructor(
    url: string,
    private readonly prefix = 'hiredesk:sess:',
  ) {
    this.redis = new Redis(url, { lazyConnect: false, maxRetriesPerRequest: 2 });
  }
  async create(session: StaffSession, ttlSeconds: number) {
    const id = newSessionId();
    await this.redis.set(this.prefix + id, JSON.stringify(session), 'EX', ttlSeconds);
    return id;
  }
  async get(id: string) {
    const raw = await this.redis.get(this.prefix + id);
    return raw ? (JSON.parse(raw) as StaffSession) : null;
  }
  async touch(id: string, ttlSeconds: number) {
    await this.redis.expire(this.prefix + id, ttlSeconds);
  }
  async destroy(id: string) {
    await this.redis.del(this.prefix + id);
  }
  async close() {
    await this.redis.quit();
  }
}
