import { NextResponse } from "next/server";
import { AuthError, requireTeacher, requireUser } from "@/lib/session";
import type { AuthUser } from "@/types/auth";

type AuthCheckResult =
  | {
      user: AuthUser;
      response: null;
    }
  | {
      user: null;
      response: NextResponse;
    };

export const requireUserOrResponse = async (): Promise<AuthCheckResult> => {
  try {
    const user = await requireUser();

    return {
      user,
      response: null,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        user: null,
        response: NextResponse.json(
          { code: error.code },
          { status: error.status },
        ),
      };
    }

    throw error;
  }
};

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

export const requireStudentOrResponse = async (): Promise<AuthCheckResult> => {
  try {
    const user = await requireUser();

    if (user.role !== "student") {
      return {
        user: null,
        response: NextResponse.json({ code: "FORBIDDEN" }, { status: 403 }),
      };
    }

    return {
      user,
      response: null,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        user: null,
        response: NextResponse.json(
          { code: error.code },
          { status: error.status },
        ),
      };
    }

    throw error;
  }
};
