import { NextResponse } from "next/server";
import { requireUserOrResponse } from "@/lib/apiAuth";
import { ClassManagementError, joinClassForStudent } from "@/lib/classes";
import { consumeRateLimit } from "@/lib/rateLimit";

const JOIN_CLASS_ATTEMPT_LIMIT = 5;
const JOIN_CLASS_WINDOW_MS = 15 * 60 * 1000;

type JoinClassRequestBody = {
  code?: unknown;
};

const isJoinClassRequestBody = (
  value: unknown,
): value is JoinClassRequestBody => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export async function POST(request: Request) {
  const auth = await requireUserOrResponse();

  if (auth.response) {
    return auth.response;
  }

  if (auth.user.role !== "student") {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "INVALID_REQUEST_BODY" }, { status: 400 });
  }

  if (!isJoinClassRequestBody(body)) {
    return NextResponse.json({ code: "INVALID_REQUEST_BODY" }, { status: 400 });
  }

  try {
    const rateLimit = consumeRateLimit({
      key: `classes:join:user:${auth.user.id}`,
      limit: JOIN_CLASS_ATTEMPT_LIMIT,
      windowMs: JOIN_CLASS_WINDOW_MS,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          code: "CLASS_JOIN_RATE_LIMITED",
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

    const result = joinClassForStudent(auth.user.id, body.code);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof ClassManagementError) {
      switch (error.code) {
        case "INVALID_CLASS_CODE":
          return NextResponse.json({ code: error.code }, { status: 400 });

        case "ALREADY_IN_CLASS":
          return NextResponse.json({ code: error.code }, { status: 409 });

        case "UNAUTHORIZED":
          return NextResponse.json({ code: error.code }, { status: 401 });

        case "FORBIDDEN":
        case "EMAIL_NOT_VERIFIED":
          return NextResponse.json({ code: error.code }, { status: 403 });
      }
    }

    console.error("Failed to join class:", error);

    return NextResponse.json({ code: "CLASS_JOIN_FAILED" }, { status: 500 });
  }
}
