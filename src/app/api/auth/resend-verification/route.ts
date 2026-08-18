import { NextResponse } from "next/server";
import { requireUserOrResponse } from "@/lib/apiAuth";
import { createEmailVerificationToken } from "@/lib/emailVerification";
import { notifyEmailVerification } from "@/lib/emailNotifications";

type ResendVerificationRequestBody = {
  language?: unknown;
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

  let body: ResendVerificationRequestBody = {};

  try {
    body = (await request.json()) as ResendVerificationRequestBody;
  } catch {
    // Language is optional, so an empty body is allowed.
  }

  const language = body.language === "en" ? "en" : "sv";

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
}
