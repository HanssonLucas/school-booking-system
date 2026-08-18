import { db } from "@/lib/db";
import type { AuthUser, DbUserRow, UserRole } from "@/types/auth";

export const isUserRole = (value: unknown): value is UserRole => {
  return value === "student" || value === "teacher";
};

export const normalizeEmail = (email: string) => {
  return email.trim().toLowerCase();
};

export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const toAuthUser = (user: DbUserRow): AuthUser => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.email_verified_at !== null,
  };
};

export const findUserByEmail = (email: string) => {
  return db
    .prepare(
      `
      SELECT
  id,
  name,
  email,
  password_hash,
  role,
  email_verified_at,
  created_at
FROM users
WHERE email = ?
      `,
    )
    .get(email) as DbUserRow | undefined;
};
