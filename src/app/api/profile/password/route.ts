import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserOrResponse } from "@/lib/apiAuth";
import { hashPassword, validatePassword, verifyPassword } from "@/lib/password";

type ChangePasswordBody = {
  currentPassword?: unknown;
  newPassword?: unknown;
};

type PasswordRow = {
  password_hash: string;
};

export async function PATCH(request: Request) {
  const auth = await requireUserOrResponse();

  if (auth.response) {
    return auth.response;
  }

  let body: ChangePasswordBody;

  try {
    body = (await request.json()) as ChangePasswordBody;
  } catch {
    return NextResponse.json({ code: "INVALID_REQUEST_BODY" }, { status: 400 });
  }

  const currentPassword =
    typeof body.currentPassword === "string" ? body.currentPassword : "";

  const newPassword =
    typeof body.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { code: "MISSING_PASSWORD_FIELDS" },
      { status: 400 },
    );
  }

  const passwordError = validatePassword(newPassword);

  if (passwordError) {
    return NextResponse.json({ code: "INVALID_PASSWORD" }, { status: 400 });
  }

  const user = db
    .prepare(
      `
        SELECT password_hash
        FROM users
        WHERE id = ?
      `,
    )
    .get(auth.user.id) as PasswordRow | undefined;

  if (!user) {
    return NextResponse.json({ code: "USER_NOT_FOUND" }, { status: 404 });
  }

  const isCurrentPasswordValid = await verifyPassword(
    currentPassword,
    user.password_hash,
  );

  if (!isCurrentPasswordValid) {
    return NextResponse.json(
      { code: "CURRENT_PASSWORD_INCORRECT" },
      { status: 400 },
    );
  }

  const newPasswordHash = await hashPassword(newPassword);

  db.prepare(
    `
      UPDATE users
      SET password_hash = ?
      WHERE id = ?
    `,
  ).run(newPasswordHash, auth.user.id);

  return NextResponse.json({
    success: true,
  });
}
