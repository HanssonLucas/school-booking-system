import { NextResponse } from "next/server";
import { findUserByEmail, normalizeEmail, toAuthUser } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { consumeRateLimit } from "@/lib/rateLimit";
import { createSession, setSessionCookie } from "@/lib/session";

const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_WINDOW_MS = 60 * 1000;

type LoginRequestBody = {
  email?: unknown;
  password?: unknown;
};

const isLoginRequestBody = (value: unknown): value is LoginRequestBody => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

  if (!isLoginRequestBody(body)) {
    return NextResponse.json(
      { error: "INVALID_REQUEST_BODY" },
      { status: 400 },
    );
  }

  const email =
    typeof body.email === "string" ? normalizeEmail(body.email) : "";

  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "MISSING_LOGIN_FIELDS" },
      { status: 400 },
    );
  }

  try {
    // Local testing only. Replace with a trusted client-IP key
    // when the hosting/proxy setup has been decided.
    if (process.env.NODE_ENV === "development") {
      const developmentLimit = consumeRateLimit({
        key: "login:development:all-clients",
        limit: 30,
        windowMs: 60 * 1000,
      });

      if (!developmentLimit.allowed) {
        return NextResponse.json(
          {
            error: "LOGIN_RATE_LIMITED",
            retryAfterSeconds: developmentLimit.retryAfterSeconds,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(developmentLimit.retryAfterSeconds),
              "Cache-Control": "no-store",
            },
          },
        );
      }
    }
    const rateLimit = consumeRateLimit({
      key: `login:email:${email}`,
      limit: LOGIN_ATTEMPT_LIMIT,
      windowMs: LOGIN_WINDOW_MS,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "LOGIN_RATE_LIMITED",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
            "Cache-Control": "no-store",
          },
        },
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
