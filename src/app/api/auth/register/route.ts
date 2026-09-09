import { NextResponse } from "next/server";
import {
  isUserRole,
  isValidEmail,
  normalizeEmail,
  toAuthUser,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword, validatePassword } from "@/lib/password";
import { createSession, setSessionCookie } from "@/lib/session";
import type { DbUserRow } from "@/types/auth";
import { createEmailVerificationToken } from "@/lib/emailVerification";
import { notifyEmailVerification } from "@/lib/emailNotifications";

type RegisterRequestBody = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  role?: unknown;
  teacherSignupCode?: unknown;
  language?: unknown;
};

const isRegisterRequestBody = (
  value: unknown,
): value is RegisterRequestBody => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isValidTeacherSignupCode = (teacherSignupCode: unknown) => {
  const configuredCode = process.env.TEACHER_SIGNUP_CODE?.trim();

  if (!configuredCode) {
    return false;
  }

  if (typeof teacherSignupCode !== "string") {
    return false;
  }

  return teacherSignupCode.trim() === configuredCode;
};

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST_BODY" },
      { status: 400 },
    );
  }

  if (!isRegisterRequestBody(body)) {
    return NextResponse.json(
      { error: "INVALID_REQUEST_BODY" },
      { status: 400 },
    );
  }

  try {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? normalizeEmail(body.email) : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = isUserRole(body.role) ? body.role : null;
    const language = body.language === "en" ? "en" : "sv";

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "MISSING_REGISTER_FIELDS" },
        { status: 400 },
      );
    }

    if (
      role === "teacher" &&
      !isValidTeacherSignupCode(body.teacherSignupCode)
    ) {
      return NextResponse.json(
        { error: "INVALID_TEACHER_SIGNUP_CODE" },
        { status: 403 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "INVALID_EMAIL" }, { status: 400 });
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      return NextResponse.json(
        { error: "INVALID_PASSWORD", message: passwordError },
        { status: 400 },
      );
    }

    const existingUser = db
      .prepare(`SELECT id FROM users WHERE email = ?`)
      .get(email);

    if (existingUser) {
      return NextResponse.json(
        { error: "EMAIL_ALREADY_EXISTS" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const result = db
      .prepare(
        `
          INSERT INTO users (name, email, password_hash, role)
          VALUES (?, ?, ?, ?)
        `,
      )
      .run(name, email, passwordHash, role);

    const user = db
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
          WHERE id = ?
        `,
      )
      .get(Number(result.lastInsertRowid)) as DbUserRow | undefined;

    if (!user) {
      return NextResponse.json(
        { error: "USER_NOT_FOUND_AFTER_CREATE" },
        { status: 500 },
      );
    }

    const { token } = createEmailVerificationToken(user.id);

    await notifyEmailVerification({
      to: user.email,
      userName: user.name,
      token,
      language,
    });

    const { sessionId, expiresAt } = createSession(user.id);

    await setSessionCookie(sessionId, expiresAt);

    return NextResponse.json({ user: toAuthUser(user) }, { status: 201 });
  } catch (error) {
    console.error("Failed to register user:", error);

    return NextResponse.json({ error: "REGISTER_FAILED" }, { status: 500 });
  }
}
