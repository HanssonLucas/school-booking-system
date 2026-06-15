import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "booking-system.db");

export const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS booking_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    slot_duration_minutes INTEGER NOT NULL DEFAULT 15,
    max_participants INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    slot_start_time TEXT,
    slot_end_time TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES booking_sessions(id) ON DELETE CASCADE
  );
`);

const bookingColumns = db.prepare(`PRAGMA table_info(bookings)`).all() as {
  name: string;
}[];

const hasColumn = (columnName: string) =>
  bookingColumns.some((column) => column.name === columnName);

if (!hasColumn("slot_start_time")) {
  db.prepare(`ALTER TABLE bookings ADD COLUMN slot_start_time TEXT`).run();
}

if (!hasColumn("slot_end_time")) {
  db.prepare(`ALTER TABLE bookings ADD COLUMN slot_end_time TEXT`).run();
}

const sessionColumns = db
  .prepare(`PRAGMA table_info(booking_sessions)`)
  .all() as {
  name: string;
}[];

const hasSessionColumn = (columnName: string) =>
  sessionColumns.some((column) => column.name === columnName);

if (!hasSessionColumn("slot_duration_minutes")) {
  db.prepare(
    `ALTER TABLE booking_sessions ADD COLUMN slot_duration_minutes INTEGER NOT NULL DEFAULT 15`,
  ).run();
}
