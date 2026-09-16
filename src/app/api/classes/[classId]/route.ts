import { NextResponse } from "next/server";
import { requireVerifiedUserOrResponse } from "@/lib/apiAuth";
import { ClassManagementError, renameClassForTeacher } from "@/lib/classes";

type RouteContext = {
  params: Promise<{ classId: string }>;
};

const headers = {
  "Cache-Control": "no-store",
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireVerifiedUserOrResponse();

  if (auth.response) {
    auth.response.headers.set("Cache-Control", "no-store");
    return auth.response;
  }

  if (auth.user.role !== "teacher") {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403, headers });
  }

  const { classId } = await params;
  const parsedClassId = Number(classId);

  if (!/^[1-9]\d*$/.test(classId) || !Number.isSafeInteger(parsedClassId)) {
    return NextResponse.json(
      { code: "INVALID_CLASS_ID" },
      { status: 400, headers },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "INVALID_REQUEST_BODY" },
      { status: 400, headers },
    );
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { code: "INVALID_REQUEST_BODY" },
      { status: 400, headers },
    );
  }

  const { name } = body as Record<string, unknown>;

  try {
    const schoolClass = renameClassForTeacher(
      auth.user.id,
      parsedClassId,
      name,
    );

    if (!schoolClass) {
      return NextResponse.json(
        { code: "CLASS_NOT_FOUND" },
        { status: 404, headers },
      );
    }

    return NextResponse.json({ schoolClass }, { headers });
  } catch (error) {
    if (
      error instanceof ClassManagementError &&
      error.code === "INVALID_CLASS_NAME"
    ) {
      return NextResponse.json(
        { code: "INVALID_CLASS_NAME" },
        { status: 400, headers },
      );
    }

    console.error("Failed to rename class:", error);

    return NextResponse.json(
      { code: "CLASS_RENAME_FAILED" },
      { status: 500, headers },
    );
  }
}
