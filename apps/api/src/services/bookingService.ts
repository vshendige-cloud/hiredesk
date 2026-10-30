import type { Kysely } from 'kysely';
import type { CreateBookingRequest } from '@hiredesk/shared';
import type { Database } from '../db/schema.ts';
import { hireDays } from '../domain/period.ts';
import { quoteHire } from '../domain/pricing.ts';
import { ConflictError, NotFoundError, ValidationError } from '../errors.ts';
import { logger } from '../logger.ts';

const ACTIVE_STATUSES = ['reserved', 'checked_out'] as const;

export class BookingService {
  constructor(private readonly db: Kysely<Database>) {}

  async isAvailable(equipmentId: number, startDate: string, endDate: string): Promise<boolean> {
    const clash = await this.db
      .selectFrom('bookings')
      .select('id')
      .where('equipment_id', '=', equipmentId)
      .where('status', 'in', ACTIVE_STATUSES)
      .where('start_date', '<=', endDate)
      .where('end_date', '>=', startDate)
      .executeTakeFirst();
    return clash === undefined;
  }

  async create(input: CreateBookingRequest, staffId: number) {
    try {
      hireDays({ startDate: input.startDate, endDate: input.endDate });
    } catch (err) {
      throw new ValidationError((err as Error).message);
    }

    const equipment = await this.db
      .selectFrom('equipment')
      .selectAll()
      .where('id', '=', input.equipmentId)
      .where('active', '=', true)
      .executeTakeFirst();
    if (!equipment) throw new NotFoundError('Equipment not found');

    // Legacy behaviour: availability is checked, then the booking is inserted, without a
    // lock or database constraint. Two concurrent requests can both pass the check.
    // Chapter 8 replaces this with a daterange column and an exclusion constraint.
    if (!(await this.isAvailable(input.equipmentId, input.startDate, input.endDate))) {
      throw new ConflictError('Equipment is already booked for part of that period');
    }

    const total = quoteHire(
      { startDate: input.startDate, endDate: input.endDate },
      { dailyRatePence: equipment.daily_rate_pence, weeklyRatePence: equipment.weekly_rate_pence },
    );

    const booking = await this.db.transaction().execute(async (trx) => {
      const customer = await trx
        .insertInto('customers')
        .values({ email: input.customerEmail.toLowerCase(), full_name: input.customerName })
        .onConflict((oc) => oc.column('email').doUpdateSet({ full_name: input.customerName }))
        .returning('id')
        .executeTakeFirstOrThrow();

      return trx
        .insertInto('bookings')
        .values({
          equipment_id: input.equipmentId,
          customer_id: customer.id,
          start_date: input.startDate,
          end_date: input.endDate,
          total_pence: total,
          created_by: staffId,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    });

    console.log('booking created', booking.id); // legacy: replaced in Chapter 8
    logger.info('booking.created', { bookingId: booking.id, equipmentId: booking.equipment_id });
    return booking;
  }

  async get(id: number) {
    const booking = await this.db.selectFrom('bookings').selectAll().where('id', '=', id).executeTakeFirst();
    if (!booking) throw new NotFoundError('Booking not found');
    return booking;
  }

  async cancel(id: number) {
    const booking = await this.get(id);
    if (booking.status !== 'reserved') {
      throw new ConflictError(`Cannot cancel a booking with status ${booking.status}`);
    }
    return this.db
      .updateTable('bookings')
      .set({ status: 'cancelled' })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}
