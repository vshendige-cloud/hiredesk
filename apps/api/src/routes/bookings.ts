import type { FastifyInstance, preHandlerHookHandler } from 'fastify';
import { z } from 'zod';
import { createBookingRequest } from '@hiredesk/shared';
import type { BookingService } from '../services/bookingService.ts';

const idParam = z.object({ id: z.coerce.number().int().positive() });

export function bookingRoutes(app: FastifyInstance, deps: { bookings: BookingService; auth: preHandlerHookHandler }) {
  app.post('/bookings', { preHandler: deps.auth }, async (request, reply) => {
    const body = createBookingRequest.parse(request.body);
    const booking = await deps.bookings.create(body, request.staff!.staffId);
    return reply.code(201).send(booking);
  });

  app.get('/bookings/:id', { preHandler: deps.auth }, async (request) => {
    return deps.bookings.get(idParam.parse(request.params).id);
  });

  app.post('/bookings/:id/cancel', { preHandler: deps.auth }, async (request) => {
    return deps.bookings.cancel(idParam.parse(request.params).id);
  });
}
