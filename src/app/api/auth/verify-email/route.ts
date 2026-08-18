import { NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/emailVerification";

type VerifyEmailRequestBody = {
  token?: unknown;
};

export async function POST(request: Request) {
  let body: VerifyEmailRequestBody;

  try {
    body = (await request.json()) as VerifyEmailRequestBody;
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST_BODY" },
      { status: 400 },
    );
  }

  if (typeof body.token !== "string" || !body.token.trim()) {
    return NextResponse.json(
      { error: "MISSING_VERIFICATION_TOKEN" },
      { status: 400 },
    );
  }

  const result = verifyEmailToken(body.token.trim());

  if (!result.success) {
    if (result.reason === "EXPIRED_TOKEN") {
      return NextResponse.json(
        { error: "EXPIRED_VERIFICATION_TOKEN" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "INVALID_VERIFICATION_TOKEN" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    verified: true,
  });
}
