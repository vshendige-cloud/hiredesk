# HireDesk

Companion repository for **Claude Coding Book: A Developer's Guide to Specifying, Controlling and
Verifying AI-Assisted Software Development** (second edition) by Vishakh Vittal Shendige.

HireDesk is the booking API for a fictional chain of equipment-hire depots. You will change it,
with Claude, in every chapter of the book. All data in this repository is synthetic.

## What is here at `ch01-start`

A working but deliberately _legacy_ service:

- **Staff authentication** uses server-side sessions in Redis with a cookie. Chapters 1, 8 and 11
  migrate it to short-lived access tokens with refresh rotation.
- **Bookings** store the hire period as two `DATE` columns, and overlap is prevented only in
  application code (check, then insert). Two simultaneous requests can both succeed. Chapter 8
  replaces this with a `daterange` and an exclusion constraint.
- **Logging** mixes Winston and `console.*` calls. Chapter 8 migrates to Fastify's Pino logger.
- **CLAUDE.md** is overloaded and partly wrong on purpose. Chapter 3 fixes it.

## Requirements

- Node.js (see `.nvmrc`) and pnpm (see `packageManager` in `package.json`)
- PostgreSQL and Redis. `docker compose up -d` starts both, or use local installs.

## Setup

```bash
pnpm install
cp .env.example .env            # then edit if your database differs
docker compose up -d            # or start PostgreSQL and Redis yourself
pnpm db:migrate
pnpm db:seed                    # prints a one-time staff password unless SEED_STAFF_PASSWORD is set
pnpm dev
```

## Commands

| Command                                              | Purpose                                                                          |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| `pnpm typecheck` / `pnpm lint` / `pnpm format:check` | Verification Ladder rung V1                                                      |
| `pnpm test`                                          | Unit tests                                                                       |
| `pnpm test:integration`                              | Integration tests (needs `TEST_DATABASE_URL`; Redis test needs `TEST_REDIS_URL`) |
| `pnpm db:migrate` / `pnpm db:rollback`               | Apply or revert migrations                                                       |
| `pnpm check`                                         | typecheck + lint + unit tests                                                    |

### Running the tests

Integration tests create and drop a temporary database for each test file. `TEST_DATABASE_URL`
must point at a server where your user can `CREATE DATABASE` (for example the `postgres`
database). Never point it at a shared or production server.

## Chapter tags

Each chapter has `chNN-start` and `chNN-end` tags. Check out the start tag to follow along and
compare your result with the end tag. Tags are added as chapters are completed.

## Templates

`docs/templates/` holds the book's working instruments: the Engineering Task Brief (F1), risk
assessment (F4), verification record (F5), repository inventory (F6), debugging log (F7), ADR and
post-mortem templates, and the blueprint schema.

## Safety

Do not add real credentials, real customer data or production connection strings to this
repository or to any Claude session that works on it. See Chapter 12.

## Licence

MIT. See `LICENSE`.
