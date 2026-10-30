import type { FastifyReply, FastifyRequest } from 'fastify';
import type { SessionStore, StaffSession } from './sessionStore.ts';

export const SESSION_COOKIE = 'hd_sid';

declare module 'fastify' {
  interface FastifyRequest {
    staff?: StaffSession;
  }
}

/** preHandler for routes that need a signed-in staff member (legacy session auth). */
export function requireStaff(sessions: SessionStore, ttlSeconds: number) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const sid = request.cookies[SESSION_COOKIE];
    if (!sid) return reply.code(401).send({ error: 'Not signed in' });
    const session = await sessions.get(sid);
    if (!session) return reply.code(401).send({ error: 'Session expired' });
    await sessions.touch(sid, ttlSeconds); // sliding expiry
    request.staff = session;
  };
}
