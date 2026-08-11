import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import type { AuthUser, UserRole } from "@/types/auth";

const SESSION_COOKIE_NAME = "school_booking_session";
const SESSION_DURATION_DAYS = 7;
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;
const SESSION_ID_BYTES = 32;

type AuthUserRow = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

export class AuthError extends Error {
  status: number;
  code: "UNAUTHORIZED" | "FORBIDDEN";

  constructor(code: "UNAUTHORIZED" | "FORBIDDEN", status: number) {
    super(code);
    this.name = "AuthError";
    this.code = code;
    this.status = status;
  }
}

export const createSession = (userId: number) => {
  const sessionId = randomBytes(SESSION_ID_BYTES).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  db.prepare(`DELETE FROM sessions WHERE expires_at <= ?`).run(
    new Date().toISOString(),
  );

  db.prepare(
    `
      INSERT INTO sessions (id, user_id, expires_at)
      VALUES (?, ?, ?)
    `,
  ).run(sessionId, userId, expiresAt.toISOString());

  return {
    sessionId,
    expiresAt,
  };
};

export const setSessionCookie = async (sessionId: string, expiresAt: Date) => {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
};

export const getSessionIdFromCookie = async () => {
  const cookieStore = await cookies();

  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
};

export const deleteSession = (sessionId: string) => {
  db.prepare(`DELETE FROM sessions WHERE id = ?`).run(sessionId);
};

export const deleteUserSessions = (userId: number) => {
  db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(userId);
};

export const clearSessionCookie = async () => {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const sessionId = await getSessionIdFromCookie();

  if (!sessionId) {
    return null;
  }

  const user = db
    .prepare(
      `
        SELECT
          users.id,
          users.name,
          users.email,
          users.role
        FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.id = ?
          AND sessions.expires_at > ?
      `,
    )
    .get(sessionId, new Date().toISOString()) as AuthUserRow | undefined;

  return user ?? null;
};

export const requireUser = async () => {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthError("UNAUTHORIZED", 401);
  }

  return user;
};

export const requireTeacher = async () => {
  const user = await requireUser();

  if (user.role !== "teacher") {
    throw new AuthError("FORBIDDEN", 403);
  }

  return user;
};
