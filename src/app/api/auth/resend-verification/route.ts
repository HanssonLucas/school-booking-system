import { NextResponse } from "next/server";
import { requireUserOrResponse } from "@/lib/apiAuth";
import {
  canResendEmailVerification,
  createEmailVerificationToken,
} from "@/lib/emailVerification";
import { notifyEmailVerification } from "@/lib/emailNotifications";
import { consumeRateLimit } from "@/lib/rateLimit";

const VERIFICATION_RESEND_LIMIT = 3;
const VERIFICATION_RESEND_WINDOW_MS = 15 * 60 * 1000;

type ResendVerificationRequestBody = {
  language?: unknown;
};

const isResendVerificationRequestBody = (
  value: unknown,
): value is ResendVerificationRequestBody => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export async function POST(request: Request) {
  const auth = await requireUserOrResponse();

  if (auth.response) {
    return auth.response;
  }

  if (auth.user.emailVerified) {
    return NextResponse.json(
      { error: "EMAIL_ALREADY_VERIFIED" },
      { status: 400 },
    );
  }

  let body: unknown = {};

  try {
    const rawBody = await request.text();

    if (rawBody.trim()) {
      body = JSON.parse(rawBody);
    }
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST_BODY" },
      { status: 400 },
    );
  }

  if (!isResendVerificationRequestBody(body)) {
    return NextResponse.json(
      { error: "INVALID_REQUEST_BODY" },
      { status: 400 },
    );
  }

  const language = body.language === "en" ? "en" : "sv";

  try {
    const rateLimit = consumeRateLimit({
      key: `resend-verification:user:${auth.user.id}`,
      limit: VERIFICATION_RESEND_LIMIT,
      windowMs: VERIFICATION_RESEND_WINDOW_MS,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "VERIFICATION_EMAIL_RATE_LIMITED",
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
    if (!canResendEmailVerification(auth.user.id)) {
      return NextResponse.json({ error: "RESEND_COOLDOWN" }, { status: 429 });
    }

    const { token } = createEmailVerificationToken(auth.user.id);

    await notifyEmailVerification({
      to: auth.user.email,
      userName: auth.user.name,
      token,
      language,
    });

    return NextResponse.json({
      sent: true,
    });
  } catch (error) {
    console.error("Failed to resend verification email:", error);

    return NextResponse.json(
      { error: "RESEND_VERIFICATION_FAILED" },
      { status: 500 },
    );
  }
}
