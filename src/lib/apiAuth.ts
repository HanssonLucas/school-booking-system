import { NextResponse } from "next/server";
import { AuthError, requireTeacher } from "@/lib/session";

export const requireTeacherOrResponse = async () => {
  try {
    await requireTeacher();
    return null;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ code: error.code }, { status: error.status });
    }

    throw error;
  }
};
