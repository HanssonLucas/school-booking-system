import { NextResponse } from "next/server";
import {
  resetPasswordWithToken,
  validatePasswordResetToken,
} from "@/lib/passwordReset";
import { consumeRateLimit } from "@/lib/rateLimit";
import { clearSessionCookie } from "@/lib/session";

const RESET_PASSWORD_ATTEMPT_LIMIT = 5;
const RESET_PASSWORD_WINDOW_MS = 60 * 1000;

type ResetPasswordRequestBody = {
  token?: unknown;
  newPassword?: unknown;
};

const isResetPasswordRequestBody = (
  value: unknown,
): value is ResetPasswordRequestBody => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const createTokenErrorResponse = (
  reason: "INVALID_TOKEN" | "EXPIRED_TOKEN",
) => {
  return NextResponse.json(
    {
      error:
        reason === "EXPIRED_TOKEN"
          ? "EXPIRED_PASSWORD_RESET_TOKEN"
          : "INVALID_PASSWORD_RESET_TOKEN",
    },
    { status: 400 },
  );
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

  if (!isResetPasswordRequestBody(body)) {
    return NextResponse.json(
      { error: "INVALID_REQUEST_BODY" },
      { status: 400 },
    );
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";

  const newPassword =
    typeof body.newPassword === "string" ? body.newPassword : "";

  if (!token || !newPassword) {
    return NextResponse.json(
      { error: "MISSING_PASSWORD_RESET_FIELDS" },
      { status: 400 },
    );
  }

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return createTokenErrorResponse("INVALID_TOKEN");
  }

  try {
    const tokenValidation = validatePasswordResetToken(token);

    if (!tokenValidation.success) {
      return createTokenErrorResponse(tokenValidation.reason);
    }

    const rateLimit = consumeRateLimit({
      key: `reset-password:user:${tokenValidation.userId}`,
      limit: RESET_PASSWORD_ATTEMPT_LIMIT,
      windowMs: RESET_PASSWORD_WINDOW_MS,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "PASSWORD_RESET_RATE_LIMITED",
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

    const result = await resetPasswordWithToken(token, newPassword);

    if (!result.success) {
      if (result.reason === "INVALID_PASSWORD") {
        return NextResponse.json(
          { error: "INVALID_PASSWORD" },
          { status: 400 },
        );
      }

      return createTokenErrorResponse(result.reason);
    }

    await clearSessionCookie();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Failed to reset password:", error);

    return NextResponse.json(
      { error: "PASSWORD_RESET_FAILED" },
      { status: 500 },
    );
  }
}
