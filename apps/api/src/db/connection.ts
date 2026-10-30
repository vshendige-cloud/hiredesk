import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { Database } from './schema.ts';

// Return DATE columns as plain 'YYYY-MM-DD' strings instead of JS Date objects,
// so hire periods never shift with the server's time zone.
pg.types.setTypeParser(pg.types.builtins.DATE, (value: string) => value);

export function createDb(connectionString: string): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new PostgresDialect({ pool: new pg.Pool({ connectionString, max: 10 }) }),
  });
}
