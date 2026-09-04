import { NextResponse } from "next/server";

import { findUserByEmail, isValidEmail, normalizeEmail } from "@/lib/auth";
import { notifyPasswordReset } from "@/lib/emailNotifications";
import {
  canRequestPasswordReset,
  createPasswordResetToken,
} from "@/lib/passwordReset";

type ForgotPasswordRequestBody = {
  email?: unknown;
  language?: unknown;
};

const createAcceptedResponse = () => {
  return NextResponse.json({ success: true });
};

export async function POST(request: Request) {
  let body: ForgotPasswordRequestBody;

  try {
    body = (await request.json()) as ForgotPasswordRequestBody;
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST_BODY" },
      { status: 400 },
    );
  }

  if (typeof body.email !== "string") {
    return NextResponse.json({ error: "MISSING_EMAIL" }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const language = body.language === "en" ? "en" : "sv";

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "INVALID_EMAIL" }, { status: 400 });
  }

  try {
    const user = findUserByEmail(email);

    if (!user) {
      return createAcceptedResponse();
    }

    if (!canRequestPasswordReset(user.id)) {
      return createAcceptedResponse();
    }

    const { token } = createPasswordResetToken(user.id);

    await notifyPasswordReset({
      to: user.email,
      userName: user.name,
      token,
      language,
    });

    return createAcceptedResponse();
  } catch (error) {
    console.error("Failed to request password reset:", error);

    return NextResponse.json(
      { error: "PASSWORD_RESET_REQUEST_FAILED" },
      { status: 500 },
    );
  }
}
