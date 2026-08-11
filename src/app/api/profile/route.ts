import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserOrResponse } from "@/lib/apiAuth";

type UpdateProfileBody = {
  name?: unknown;
};

export async function PATCH(request: Request) {
  const auth = await requireUserOrResponse();

  if (auth.response) {
    return auth.response;
  }

  let body: UpdateProfileBody;

  try {
    body = (await request.json()) as UpdateProfileBody;
  } catch {
    return NextResponse.json({ code: "INVALID_REQUEST_BODY" }, { status: 400 });
  }

  if (typeof body.name !== "string") {
    return NextResponse.json({ code: "INVALID_NAME" }, { status: 400 });
  }

  const name = body.name.trim();

  if (name.length < 1 || name.length > 80) {
    return NextResponse.json({ code: "INVALID_NAME" }, { status: 400 });
  }

  db.prepare(
    `
      UPDATE users
      SET name = ?
      WHERE id = ?
    `,
  ).run(name, auth.user.id);

  return NextResponse.json({
    user: {
      ...auth.user,
      name,
    },
  });
}
