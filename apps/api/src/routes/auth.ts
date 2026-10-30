import type { FastifyInstance } from 'fastify';
import type { Kysely } from 'kysely';
import { loginRequest } from '@hiredesk/shared';
import type { Database } from '../db/schema.ts';
import { verifyPassword } from '../auth/password.ts';
import { SESSION_COOKIE } from '../auth/plugin.ts';
import type { SessionStore } from '../auth/sessionStore.ts';

export function authRoutes(
  app: FastifyInstance,
  deps: { db: Kysely<Database>; sessions: SessionStore; ttlSeconds: number; secureCookies: boolean },
) {
  app.post('/auth/login', async (request, reply) => {
    const body = loginRequest.parse(request.body);
    const user = await deps.db
      .selectFrom('staff_users')
      .selectAll()
      .where('email', '=', body.email.toLowerCase())
      .executeTakeFirst();
    // Same response for unknown user and wrong password.
    if (!user || !(await verifyPassword(body.password, user.password_hash))) {
      return reply.code(401).send({ error: 'Invalid email or password' });
    }
    const sid = await deps.sessions.create(
      { staffId: user.id, role: user.role, depotId: user.depot_id, createdAt: new Date().toISOString() },
      deps.ttlSeconds,
    );
    reply.setCookie(SESSION_COOKIE, sid, {
      httpOnly: true,
      sameSite: 'lax',
      secure: deps.secureCookies,
      path: '/',
      maxAge: deps.ttlSeconds,
    });
    return { staffId: user.id, role: user.role };
  });

  app.post('/auth/logout', async (request, reply) => {
    const sid = request.cookies[SESSION_COOKIE];
    if (sid) await deps.sessions.destroy(sid);
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return { ok: true };
  });
}
