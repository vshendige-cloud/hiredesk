// Seeds a development database with SYNTHETIC data only. Never point this at production.
import { randomBytes } from 'node:crypto';
import { createDb } from '../apps/api/src/db/connection.ts';
import { hashPassword } from '../apps/api/src/auth/password.ts';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

const db = createDb(url);
const password = process.env.SEED_STAFF_PASSWORD ?? randomBytes(9).toString('base64url');

const depots = await db
  .insertInto('depots')
  .values([
    { code: 'MAN', name: 'Manchester Depot' },
    { code: 'LDS', name: 'Leeds Depot' },
  ])
  .onConflict((oc) => oc.column('code').doNothing())
  .returning(['id', 'code'])
  .execute();

const man =
  depots.find((d) => d.code === 'MAN') ??
  (await db.selectFrom('depots').select(['id', 'code']).where('code', '=', 'MAN').executeTakeFirstOrThrow());
const lds =
  depots.find((d) => d.code === 'LDS') ??
  (await db.selectFrom('depots').select(['id', 'code']).where('code', '=', 'LDS').executeTakeFirstOrThrow());

await db
  .insertInto('equipment')
  .values([
    {
      depot_id: man.id,
      sku: 'MAN-MINI-01',
      name: '1.5t Mini Excavator',
      daily_rate_pence: 9500,
      weekly_rate_pence: 38000,
    },
    {
      depot_id: man.id,
      sku: 'MAN-SCAF-03',
      name: 'Scaffold Tower 5m',
      daily_rate_pence: 4200,
      weekly_rate_pence: 16800,
    },
    {
      depot_id: lds.id,
      sku: 'LDS-DUMP-02',
      name: 'High-tip Dumper 1t',
      daily_rate_pence: 7800,
      weekly_rate_pence: 31200,
    },
    { depot_id: lds.id, sku: 'LDS-WACK-07', name: 'Plate Compactor', daily_rate_pence: 3100, weekly_rate_pence: 12400 },
  ])
  .onConflict((oc) => oc.column('sku').doNothing())
  .execute();

await db
  .insertInto('staff_users')
  .values({
    email: 'counter@man.hiredesk.example',
    password_hash: await hashPassword(password),
    role: 'staff',
    depot_id: man.id,
  })
  .onConflict((oc) => oc.column('email').doUpdateSet({ password_hash: (eb) => eb.ref('excluded.password_hash') }))
  .execute();

console.log('Seed complete (synthetic data).');
console.log('Staff login: counter@man.hiredesk.example');
if (!process.env.SEED_STAFF_PASSWORD) console.log(`Generated password (shown once): ${password}`);
await db.destroy();
