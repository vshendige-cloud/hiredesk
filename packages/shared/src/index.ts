import { z } from 'zod';

/** ISO calendar date, e.g. 2026-11-03. Hire periods are whole days, inclusive. */
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

export const loginRequest = z.object({
  email: z.email(),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof loginRequest>;

export const createBookingRequest = z.object({
  equipmentId: z.number().int().positive(),
  customerEmail: z.email(),
  customerName: z.string().min(1).max(200),
  startDate: isoDate,
  endDate: isoDate,
});
export type CreateBookingRequest = z.infer<typeof createBookingRequest>;

export const availabilityQuery = z.object({
  from: isoDate,
  to: isoDate,
});

export const bookingStatus = z.enum(['reserved', 'checked_out', 'returned', 'cancelled']);
export type BookingStatus = z.infer<typeof bookingStatus>;
