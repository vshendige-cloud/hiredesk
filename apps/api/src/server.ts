import Fastify, { type FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import type { Kysely } from 'kysely';
import { ZodError } from 'zod';
import type { Database } from './db/schema.ts';
import type { SessionStore } from './auth/sessionStore.ts';
import { requireStaff } from './auth/plugin.ts';
import { BookingService } from './services/bookingService.ts';
import { authRoutes } from './routes/auth.ts';
import { equipmentRoutes } from './routes/equipment.ts';
import { bookingRoutes } from './routes/bookings.ts';
import { logger } from './logger.ts';

export interface AppDeps {
  db: Kysely<Database>;
  sessions: SessionStore;
  sessionTtlSeconds: number;
  secureCookies: boolean;
}

export function buildApp(deps: AppDeps): FastifyInstance {
  // Fastify's own (Pino) logger is disabled in the legacy setup; Winston is used instead.
  const app = Fastify({ logger: false });
  app.register(cookie);

  const auth = requireStaff(deps.sessions, deps.sessionTtlSeconds);
  const bookings = new BookingService(deps.db);

  app.get('/health', async () => ({ status: 'ok' }));
  authRoutes(app, {
    db: deps.db,
    sessions: deps.sessions,
    ttlSeconds: deps.sessionTtlSeconds,
    secureCookies: deps.secureCookies,
  });
  equipmentRoutes(app, { db: deps.db, bookings, auth });
  bookingRoutes(app, { bookings, auth });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({ error: 'Invalid request', issues: error.issues });
    }
    const status = (error as { statusCode?: number }).statusCode;
    if (status && status >= 400 && status < 500) {
      return reply.code(status).send({ error: (error as Error).message });
    }
    logger.error('unhandled error', { url: request.url, message: (error as Error).message });
    return reply.code(500).send({ error: 'Internal server error' });
  });

  return app;
}
