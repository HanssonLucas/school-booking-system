import { NextResponse } from "next/server";
import { requireVerifiedUserOrResponse } from "@/lib/apiAuth";
import { ClassManagementError, createClassForTeacher } from "@/lib/classes";

type CreateClassRequestBody = {
  name?: unknown;
};

const isCreateClassRequestBody = (
  value: unknown,
): value is CreateClassRequestBody => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export async function POST(request: Request) {
  const auth = await requireVerifiedUserOrResponse();

  if (auth.response) {
    return auth.response;
  }

  if (auth.user.role !== "teacher") {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "INVALID_REQUEST_BODY" }, { status: 400 });
  }

  if (!isCreateClassRequestBody(body)) {
    return NextResponse.json({ code: "INVALID_REQUEST_BODY" }, { status: 400 });
  }

  try {
    const result = createClassForTeacher(auth.user.id, body.name);

    return NextResponse.json(result, {
      status: 201,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof ClassManagementError) {
      const status =
        error.code === "UNAUTHORIZED"
          ? 401
          : error.code === "INVALID_CLASS_NAME"
            ? 400
            : 403;

      return NextResponse.json({ code: error.code }, { status });
    }

    console.error("Failed to create class:", error);

    return NextResponse.json({ code: "CLASS_CREATE_FAILED" }, { status: 500 });
  }
}
