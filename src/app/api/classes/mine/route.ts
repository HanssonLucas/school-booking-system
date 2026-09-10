import { NextResponse } from "next/server";
import { requireUserOrResponse } from "@/lib/apiAuth";
import { getClassForStudent } from "@/lib/classes";

export async function GET() {
  const auth = await requireUserOrResponse();

  if (auth.response) {
    return auth.response;
  }

  if (auth.user.role !== "student") {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const schoolClass = getClassForStudent(auth.user.id);

    return NextResponse.json(
      { schoolClass },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Failed to get student class:", error);

    return NextResponse.json(
      { code: "STUDENT_CLASS_FETCH_FAILED" },
      { status: 500 },
    );
  }
}
