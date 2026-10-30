import { loadConfig } from './config.ts';
import { createDb } from './db/connection.ts';
import { MemorySessionStore, RedisSessionStore } from './auth/sessionStore.ts';
import { buildApp } from './server.ts';

const config = loadConfig();
const db = createDb(config.DATABASE_URL);
const sessions = config.REDIS_URL ? new RedisSessionStore(config.REDIS_URL) : new MemorySessionStore();
if (!config.REDIS_URL) console.warn('REDIS_URL not set: using in-memory sessions (development only)');

const app = buildApp({
  db,
  sessions,
  sessionTtlSeconds: config.SESSION_TTL_SECONDS,
  secureCookies: config.NODE_ENV === 'production',
});

app.listen({ port: config.PORT, host: '0.0.0.0' }).then((address) => {
  console.log(`HireDesk API listening on ${address}`); // legacy: replaced in Chapter 8
});

const shutdown = async () => {
  await app.close();
  await sessions.close();
  await db.destroy();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
