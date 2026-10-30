import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runner } from 'node-pg-migrate';

const here = path.dirname(fileURLToPath(import.meta.url));
export const migrationsDir = path.resolve(here, '../../../../db/migrations');

export async function migrate(databaseUrl: string, direction: 'up' | 'down', count?: number): Promise<void> {
  await runner({
    databaseUrl,
    dir: migrationsDir,
    direction,
    count: count ?? (direction === 'down' ? 1 : Infinity),
    migrationsTable: 'pgmigrations',
    log: () => {},
  });
}

// CLI: tsx src/db/migrate.ts up|down
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const direction = process.argv[2] === 'down' ? 'down' : 'up';
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }
  migrate(url, direction)
    .then(() => console.log(`Migrations ${direction} complete`))
    .catch((err: unknown) => {
      console.error(err);
      process.exit(1);
    });
}
