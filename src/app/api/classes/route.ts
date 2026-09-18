import { NextResponse } from "next/server";
import { requireVerifiedUserOrResponse } from "@/lib/apiAuth";
import {
  ClassManagementError,
  createClassForTeacher,
  getClassesForTeacher,
} from "@/lib/classes";

const headers = { "Cache-Control": "no-store" };

export async function GET() {
  const auth = await requireVerifiedUserOrResponse();
  if (auth.response) {
    auth.response.headers.set("Cache-Control", "no-store");
    return auth.response;
  }
  if (auth.user.role !== "teacher") {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403, headers });
  }
  try {
    const classes = getClassesForTeacher(auth.user.id);
    return NextResponse.json({ classes }, { headers });
  } catch (error) {
    console.error("Failed to get teacher classes:", error);
    return NextResponse.json(
      { code: "CLASSES_FETCH_FAILED" },
      { status: 500, headers },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireVerifiedUserOrResponse();
  if (auth.response) {
    auth.response.headers.set("Cache-Control", "no-store");
    return auth.response;
  }
  if (auth.user.role !== "teacher") {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403, headers });
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

  const { name, designation, description } = body as Record<string, unknown>;
  try {
    const result = createClassForTeacher(auth.user.id, name, {
      designation,
      description,
    });
    return NextResponse.json(result, { status: 201, headers });
  } catch (error) {
    if (error instanceof ClassManagementError) {
      const status =
        error.code === "UNAUTHORIZED"
          ? 401
          : [
                "INVALID_CLASS_NAME",
                "INVALID_CLASS_DESIGNATION",
                "INVALID_CLASS_DESCRIPTION",
              ].includes(error.code)
            ? 400
            : 403;
      return NextResponse.json({ code: error.code }, { status, headers });
    }
    console.error("Failed to create class:", error);
    return NextResponse.json(
      { code: "CLASS_CREATE_FAILED" },
      { status: 500, headers },
    );
  }
}
