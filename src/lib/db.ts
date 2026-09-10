import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "booking-system.db");

export const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'teacher')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

    CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    created_by_user_id INTEGER NOT NULL,
    join_code_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user_id)
      REFERENCES users(id) ON DELETE RESTRICT
  );

  CREATE INDEX IF NOT EXISTS idx_classes_created_by_user_id
    ON classes(created_by_user_id);

  CREATE TABLE IF NOT EXISTS class_teachers (
    class_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (class_id, teacher_id),
    FOREIGN KEY (class_id)
      REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id)
      REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_class_teachers_teacher_id
    ON class_teachers(teacher_id);

  CREATE TABLE IF NOT EXISTS class_students (
    student_id INTEGER PRIMARY KEY,
    class_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id)
      REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id)
      REFERENCES classes(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_class_students_class_id
    ON class_students(class_id);

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY,
    attempts INTEGER NOT NULL DEFAULT 0 CHECK(attempts >= 0),
    expires_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_rate_limits_expires_at
    ON rate_limits(expires_at);

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
    user_id INTEGER,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    slot_start_time TEXT,
    slot_end_time TEXT,
    language TEXT NOT NULL DEFAULT 'sv',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES booking_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );
  
  CREATE TABLE IF NOT EXISTS users (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'teacher')),
    email_verified_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const userColumns = db.prepare(`PRAGMA table_info(users)`).all() as {
  name: string;
}[];

const hasUserColumn = (columnName: string) =>
  userColumns.some((column) => column.name === columnName);

if (!hasUserColumn("email_verified_at")) {
  db.prepare(`ALTER TABLE users ADD COLUMN email_verified_at TEXT`).run();

  db.prepare(
    `
    UPDATE users
    SET email_verified_at = CURRENT_TIMESTAMP
  `,
  ).run();
}

const bookingColumns = db.prepare(`PRAGMA table_info(bookings)`).all() as {
  name: string;
}[];

const hasBookingColumn = (columnName: string) =>
  bookingColumns.some((column) => column.name === columnName);

if (!hasBookingColumn("slot_start_time")) {
  db.prepare(`ALTER TABLE bookings ADD COLUMN slot_start_time TEXT`).run();
}

if (!hasBookingColumn("slot_end_time")) {
  db.prepare(`ALTER TABLE bookings ADD COLUMN slot_end_time TEXT`).run();
}

if (!hasBookingColumn("language")) {
  db.prepare(
    `ALTER TABLE bookings ADD COLUMN language TEXT NOT NULL DEFAULT 'sv'`,
  ).run();
}

if (!hasBookingColumn("user_id")) {
  db.prepare(`ALTER TABLE bookings ADD COLUMN user_id INTEGER`).run();
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
