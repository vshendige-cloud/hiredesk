# HireDesk – Instructions for Claude

<!--
  NOTE FOR READERS: this file is deliberately overloaded. It is the starting point for the
  Chapter 3 exercise (repository tag ch03-start). Do not copy it as an example of good practice.
-->

## About the company

HireDesk is the booking platform for a regional chain of tool and equipment hire depots in the
north of England. We started with one depot in Manchester and now have several. Our customers are
builders, landscapers, homeowners and facilities teams. We care about great customer service and
we want the software to reflect our values of reliability, friendliness and value for money.
Customers can reserve equipment online and depot staff manage check-out, returns and damage notes.

## General rules

- Write clean code.
- Write good, readable, maintainable code.
- Always follow best practices.
- Use meaningful variable names.
- Don't write bad code.
- Make sure the code is correct.
- Be careful.
- Think step by step.
- Always explain your reasoning in detail before doing anything.
- Always run the full test suite after every change, no matter how small.
- Prefer running a single test file rather than the whole suite.
- Use npm to install packages.
- IMPORTANT: Always ask before editing any file.
- IMPORTANT: Don't ask too many questions, just get on with it.
- Comments are good. Add a comment to every function.
- Avoid unnecessary comments.

## Tech stack

We use TypeScript, Node.js, Fastify, PostgreSQL, Redis, Kysely, Winston, Zod and Vitest.
TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.
Fastify is a fast and low overhead web framework for Node.js.
PostgreSQL is a powerful, open source object-relational database system.
Redis is an in-memory data store.
Kysely is a type-safe SQL query builder for TypeScript.
Zod is a TypeScript-first schema validation library.
Vitest is a testing framework.

## File-by-file guide

- package.json – the root package file. Contains scripts.
- pnpm-workspace.yaml – lists the workspace packages.
- tsconfig.base.json – shared TypeScript settings.
- eslint.config.js – ESLint configuration.
- apps/api/package.json – the API package file.
- apps/api/src/index.ts – starts the server.
- apps/api/src/server.ts – builds the Fastify app.
- apps/api/src/config.ts – loads configuration from environment variables.
- apps/api/src/logger.ts – the logger.
- apps/api/src/errors.ts – error classes.
- apps/api/src/db/connection.ts – creates the database connection.
- apps/api/src/db/schema.ts – database table types.
- apps/api/src/db/migrate.ts – runs migrations.
- apps/api/src/domain/period.ts – hire period helpers.
- apps/api/src/domain/pricing.ts – pricing.
- apps/api/src/auth/password.ts – password hashing.
- apps/api/src/auth/sessionStore.ts – sessions.
- apps/api/src/auth/plugin.ts – auth pre-handler.
- apps/api/src/routes/auth.ts – login and logout routes.
- apps/api/src/routes/equipment.ts – equipment routes.
- apps/api/src/routes/bookings.ts – booking routes.
- apps/api/src/services/bookingService.ts – booking logic.
- packages/shared/src/index.ts – shared schemas.
- db/migrations – migrations.
- scripts/seed.ts – seed script.

## API documentation

### POST /auth/login

Request body: `{ "email": string, "password": string }`. Returns `{ staffId, role }` and sets the
`hd_sid` cookie. Returns 401 for invalid credentials.

### POST /auth/logout

Clears the session. Returns `{ ok: true }`.

### GET /health

Returns `{ status: "ok" }`.

### GET /equipment

Optional query `depot` (depot code). Requires a session. Returns an array of equipment objects with
`id`, `sku`, `name`, `daily_rate_pence`, `weekly_rate_pence`, `depot_code`.

### GET /equipment/:id/availability

Query `from` and `to` as YYYY-MM-DD. Requires a session. Returns `{ equipmentId, from, to, available }`.

### POST /bookings

Body: `{ equipmentId, customerEmail, customerName, startDate, endDate }`. Requires a session.
Returns 201 with the booking, 409 if the equipment is already booked, 404 if the equipment does not
exist, 400 for invalid input.

### GET /bookings/:id

Returns the booking or 404.

### POST /bookings/:id/cancel

Cancels a reserved booking. Returns 409 if the booking is not in the reserved state.

## Pricing

Pricing uses the daily rate and the weekly rate. A week is seven days. Full weeks are charged at the
weekly rate. Extra days are charged at the daily rate, capped at the weekly rate. All money is in
pence. Use integers for money. Never use floating point for money. Money is always in pence.

## Database

We use PostgreSQL 14. Migrations are in db/migrations. Run `pnpm db:migrate`.
Bookings have a start date and an end date. Both are inclusive.

## Testing

Use Vitest. Unit tests are in apps/api/test/unit. Integration tests are in apps/api/test/integration
and need TEST_DATABASE_URL. Write tests for everything. Aim for 100% coverage. Run `npm test`.

## Release process

1. Ask Dave.
2. Dave deploys on Thursdays.
3. Don't deploy on Fridays.

## Misc

- The office closes at 5:30pm.
- The Leeds depot opened in 2024.
- Remember to be friendly in commit messages.
- Last updated: March 2025.
