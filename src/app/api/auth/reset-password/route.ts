import { NextResponse } from "next/server";

import { resetPasswordWithToken } from "@/lib/passwordReset";
import { clearSessionCookie } from "@/lib/session";

type ResetPasswordRequestBody = {
  token?: unknown;
  newPassword?: unknown;
};

export async function POST(request: Request) {
  let body: ResetPasswordRequestBody;

  try {
    body = (await request.json()) as ResetPasswordRequestBody;
  } catch {
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

  try {
    const result = await resetPasswordWithToken(token, newPassword);

    if (!result.success) {
      if (result.reason === "INVALID_PASSWORD") {
        return NextResponse.json(
          { error: "INVALID_PASSWORD" },
          { status: 400 },
        );
      }

      if (result.reason === "EXPIRED_TOKEN") {
        return NextResponse.json(
          { error: "EXPIRED_PASSWORD_RESET_TOKEN" },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: "INVALID_PASSWORD_RESET_TOKEN" },
        { status: 400 },
      );
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
