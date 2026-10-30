-- Up Migration
-- HireDesk baseline schema (repository tag ch01-start).
-- Known legacy choices, kept deliberately for later chapters:
--   * bookings store the hire period as two DATE columns and rely on application code
--     to prevent overlapping bookings (Chapter 8 replaces this with a daterange and an
--     exclusion constraint using expand-and-contract).
--   * staff sessions live in Redis, not in the database (Chapter 1 and Chapter 8 migrate
--     authentication to short-lived access tokens with refresh rotation).

CREATE TABLE depots (
  id          serial PRIMARY KEY,
  code        text NOT NULL UNIQUE,
  name        text NOT NULL
);

CREATE TABLE equipment (
  id                 serial PRIMARY KEY,
  depot_id           integer NOT NULL REFERENCES depots(id),
  sku                text NOT NULL UNIQUE,
  name               text NOT NULL,
  daily_rate_pence   integer NOT NULL CHECK (daily_rate_pence > 0),
  weekly_rate_pence  integer NOT NULL CHECK (weekly_rate_pence > 0),
  active             boolean NOT NULL DEFAULT true
);

CREATE TABLE customers (
  id          serial PRIMARY KEY,
  email       text NOT NULL UNIQUE,
  full_name   text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE staff_users (
  id             serial PRIMARY KEY,
  email          text NOT NULL UNIQUE,
  password_hash  text NOT NULL,
  role           text NOT NULL CHECK (role IN ('staff', 'manager')),
  depot_id       integer NOT NULL REFERENCES depots(id)
);

CREATE TABLE bookings (
  id             serial PRIMARY KEY,
  equipment_id   integer NOT NULL REFERENCES equipment(id),
  customer_id    integer NOT NULL REFERENCES customers(id),
  start_date     date NOT NULL,
  end_date       date NOT NULL,
  status         text NOT NULL DEFAULT 'reserved'
                 CHECK (status IN ('reserved', 'checked_out', 'returned', 'cancelled')),
  total_pence    integer NOT NULL CHECK (total_pence >= 0),
  created_by     integer NOT NULL REFERENCES staff_users(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

CREATE INDEX bookings_equipment_dates_idx ON bookings (equipment_id, start_date, end_date);

-- Down Migration
DROP TABLE bookings;
DROP TABLE staff_users;
DROP TABLE customers;
DROP TABLE equipment;
DROP TABLE depots;
