import type { Generated, ColumnType } from 'kysely';

type DateOnly = ColumnType<string, string, string>;

export interface DepotsTable {
  id: Generated<number>;
  code: string;
  name: string;
}

export interface EquipmentTable {
  id: Generated<number>;
  depot_id: number;
  sku: string;
  name: string;
  daily_rate_pence: number;
  weekly_rate_pence: number;
  active: Generated<boolean>;
}

export interface CustomersTable {
  id: Generated<number>;
  email: string;
  full_name: string;
  created_at: Generated<Date>;
}

export interface StaffUsersTable {
  id: Generated<number>;
  email: string;
  password_hash: string;
  role: 'staff' | 'manager';
  depot_id: number;
}

export interface BookingsTable {
  id: Generated<number>;
  equipment_id: number;
  customer_id: number;
  start_date: DateOnly;
  end_date: DateOnly;
  status: Generated<'reserved' | 'checked_out' | 'returned' | 'cancelled'>;
  total_pence: number;
  created_by: number;
  created_at: Generated<Date>;
}

export interface Database {
  depots: DepotsTable;
  equipment: EquipmentTable;
  customers: CustomersTable;
  staff_users: StaffUsersTable;
  bookings: BookingsTable;
}
