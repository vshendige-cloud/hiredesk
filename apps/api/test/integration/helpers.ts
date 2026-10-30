import { randomBytes } from 'node:crypto';
import pg from 'pg';
import { createDb } from '../../src/db/connection.ts';
import { migrate } from '../../src/db/migrate.ts';
import { hashPassword } from '../../src/auth/password.ts';
import { MemorySessionStore, type SessionStore } from '../../src/auth/sessionStore.ts';
import { buildApp } from '../../src/server.ts';

/**
 * Creates a throwaway database, migrates it, seeds minimal synthetic data and builds the app.
 * Requires TEST_DATABASE_URL pointing at a server where the user may CREATE DATABASE,
 * for example postgres://postgres@127.0.0.1:5432/postgres
 */
export async function setupTestApp(opts: { sessions?: SessionStore } = {}) {
  const adminUrl = process.env.TEST_DATABASE_URL;
  if (!adminUrl) throw new Error('TEST_DATABASE_URL is not set; see README "Running the tests"');

  const dbName = `hiredesk_test_${randomBytes(4).toString('hex')}`;
  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();
  await admin.query(`CREATE DATABASE ${dbName}`);
  await admin.end();

  const url = new URL(adminUrl);
  url.pathname = `/${dbName}`;
  const databaseUrl = url.toString();
  await migrate(databaseUrl, 'up');

  const db = createDb(databaseUrl);
  const depot = await db
    .insertInto('depots')
    .values({ code: 'MAN', name: 'Manchester Depot' })
    .returning('id')
    .executeTakeFirstOrThrow();
  const equipment = await db
    .insertInto('equipment')
    .values({
      depot_id: depot.id,
      sku: 'MAN-MINI-01',
      name: '1.5t Mini Excavator',
      daily_rate_pence: 9500,
      weekly_rate_pence: 38000,
    })
    .returning('id')
    .executeTakeFirstOrThrow();
  const password = 'test-only-password';
  await db
    .insertInto('staff_users')
    .values({
      email: 'counter@man.hiredesk.example',
      password_hash: await hashPassword(password),
      role: 'staff',
      depot_id: depot.id,
    })
    .execute();

  const sessions = opts.sessions ?? new MemorySessionStore();
  const app = buildApp({ db, sessions, sessionTtlSeconds: 3600, secureCookies: false });
  await app.ready();

  async function login(): Promise<string> {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'counter@man.hiredesk.example', password },
    });
    if (res.statusCode !== 200) throw new Error(`login failed: ${res.statusCode} ${res.body}`);
    const cookie = res.cookies.find((c) => c.name === 'hd_sid');
    if (!cookie) throw new Error('no session cookie');
    return `hd_sid=${cookie.value}`;
  }

  async function teardown() {
    await app.close();
    await sessions.close();
    await db.destroy();
    const admin2 = new pg.Client({ connectionString: adminUrl });
    await admin2.connect();
    await admin2.query(`DROP DATABASE IF EXISTS ${dbName} WITH (FORCE)`);
    await admin2.end();
  }

  return { app, db, equipmentId: equipment.id, password, login, teardown };
}
