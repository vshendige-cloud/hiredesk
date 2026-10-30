import type { FastifyInstance, preHandlerHookHandler } from 'fastify';
import type { Kysely } from 'kysely';
import { z } from 'zod';
import { availabilityQuery } from '@hiredesk/shared';
import type { Database } from '../db/schema.ts';
import type { BookingService } from '../services/bookingService.ts';
import { NotFoundError } from '../errors.ts';

export function equipmentRoutes(
  app: FastifyInstance,
  deps: { db: Kysely<Database>; bookings: BookingService; auth: preHandlerHookHandler },
) {
  app.get('/equipment', { preHandler: deps.auth }, async (request) => {
    const { depot } = z.object({ depot: z.string().optional() }).parse(request.query);
    let query = deps.db
      .selectFrom('equipment')
      .innerJoin('depots', 'depots.id', 'equipment.depot_id')
      .select([
        'equipment.id',
        'equipment.sku',
        'equipment.name',
        'equipment.daily_rate_pence',
        'equipment.weekly_rate_pence',
        'depots.code as depot_code',
      ])
      .where('equipment.active', '=', true)
      .orderBy('equipment.id');
    if (depot) query = query.where('depots.code', '=', depot);
    return query.execute();
  });

  app.get('/equipment/:id/availability', { preHandler: deps.auth }, async (request) => {
    const { id } = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
    const { from, to } = availabilityQuery.parse(request.query);
    const exists = await deps.db.selectFrom('equipment').select('id').where('id', '=', id).executeTakeFirst();
    if (!exists) throw new NotFoundError('Equipment not found');
    return { equipmentId: id, from, to, available: await deps.bookings.isAvailable(id, from, to) };
  });
}
