import { NextResponse } from "next/server";
import { findUserByEmail, normalizeEmail, toAuthUser } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { createSession, setSessionCookie } from "@/lib/session";

type LoginRequestBody = {
  email?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginRequestBody;

    const email =
      typeof body.email === "string" ? normalizeEmail(body.email) : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "MISSING_LOGIN_FIELDS" },
        { status: 400 },
      );
    }

    const user = findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: "INVALID_LOGIN_CREDENTIALS" },
        { status: 401 },
      );
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "INVALID_LOGIN_CREDENTIALS" },
        { status: 401 },
      );
    }

    const { sessionId, expiresAt } = createSession(user.id);

    await setSessionCookie(sessionId, expiresAt);

    return NextResponse.json({
      user: toAuthUser(user),
    });
  } catch (error) {
    console.error("Failed to login user:", error);

    return NextResponse.json({ error: "LOGIN_FAILED" }, { status: 500 });
  }
}
