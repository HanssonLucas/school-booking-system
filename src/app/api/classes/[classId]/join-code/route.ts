import { NextResponse } from "next/server";
import { requireVerifiedUserOrResponse } from "@/lib/apiAuth";
import { regenerateClassJoinCodeForTeacher } from "@/lib/classes";

type RouteContext = {
  params: Promise<{ classId: string }>;
};

const headers = {
  "Cache-Control": "no-store",
};

export async function POST(_request: Request, { params }: RouteContext) {
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

  try {
    const result = regenerateClassJoinCodeForTeacher(
      auth.user.id,
      parsedClassId,
    );

    if (!result) {
      return NextResponse.json(
        { code: "CLASS_NOT_FOUND" },
        { status: 404, headers },
      );
    }

    return NextResponse.json(result, { headers });
  } catch (error) {
    console.error("Failed to regenerate class join code:", error);

    return NextResponse.json(
      { code: "CLASS_JOIN_CODE_REGENERATE_FAILED" },
      { status: 500, headers },
    );
  }
}
