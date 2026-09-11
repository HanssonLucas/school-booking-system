import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  DEFAULT_SLOT_DURATION_MINUTES,
  getSlotCount,
} from "@/lib/bookingSlots";
import { requireVerifiedUserOrResponse } from "@/lib/apiAuth";

export async function GET() {
  const sessions = db
    .prepare(
      `
      SELECT
        booking_sessions.id,
        booking_sessions.title,
        booking_sessions.description,
        booking_sessions.date,
        booking_sessions.start_time AS startTime,
        booking_sessions.end_time AS endTime,
        booking_sessions.slot_duration_minutes AS slotDurationMinutes,
        booking_sessions.max_participants AS maxParticipants,
        COUNT(bookings.id) AS bookedParticipants
      FROM booking_sessions
      LEFT JOIN bookings
        ON bookings.session_id = booking_sessions.id
      GROUP BY booking_sessions.id
      ORDER BY booking_sessions.date ASC, booking_sessions.start_time ASC
      `,
    )
    .all();

  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  const authResult = await requireVerifiedUserOrResponse();

  if (authResult.response) {
    return authResult.response;
  }

  const teacher = authResult.user;

  if (teacher.role !== "teacher") {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "INVALID_REQUEST_BODY" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ code: "INVALID_REQUEST_BODY" }, { status: 400 });
  }

  const {
    title,
    description,
    date,
    startTime,
    endTime,
    classId,
    slotDurationMinutes = DEFAULT_SLOT_DURATION_MINUTES,
  } = body as Record<string, unknown>;

  if (
    typeof classId !== "number" ||
    !Number.isSafeInteger(classId) ||
    classId <= 0
  ) {
    return NextResponse.json({ code: "INVALID_CLASS_ID" }, { status: 400 });
  }

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof date !== "string" ||
    !date ||
    typeof startTime !== "string" ||
    !startTime ||
    typeof endTime !== "string" ||
    !endTime
  ) {
    return NextResponse.json(
      { code: "MISSING_SESSION_FIELDS" },
      { status: 400 },
    );
  }

  if (description != null && typeof description !== "string") {
    return NextResponse.json({ code: "INVALID_REQUEST_BODY" }, { status: 400 });
  }

  const parsedSlotDurationMinutes = Number(slotDurationMinutes);

  if (
    !Number.isSafeInteger(parsedSlotDurationMinutes) ||
    parsedSlotDurationMinutes <= 0
  ) {
    return NextResponse.json(
      { code: "INVALID_SLOT_DURATION" },
      { status: 400 },
    );
  }

  const maxParticipants = getSlotCount(
    startTime,
    endTime,
    parsedSlotDurationMinutes,
  );

  if (!Number.isSafeInteger(maxParticipants) || maxParticipants <= 0) {
    return NextResponse.json(
      { code: "INVALID_SESSION_TIME_RANGE" },
      { status: 400 },
    );
  }

  const result = db
    .prepare(
      `
        INSERT INTO booking_sessions (
          title,
          description,
          date,
          start_time,
          end_time,
          slot_duration_minutes,
          max_participants,
          class_id,
          teacher_id
        )
        SELECT
          ?, ?, ?, ?, ?, ?, ?,
          class_teachers.class_id,
          class_teachers.teacher_id
        FROM class_teachers
        INNER JOIN users
          ON users.id = class_teachers.teacher_id
        WHERE class_teachers.class_id = ?
          AND class_teachers.teacher_id = ?
          AND users.role = 'teacher'
          AND users.email_verified_at IS NOT NULL
      `,
    )
    .run(
      title.trim(),
      description ?? "",
      date,
      startTime,
      endTime,
      parsedSlotDurationMinutes,
      maxParticipants,
      classId,
      teacher.id,
    );

  if (result.changes === 0) {
    return NextResponse.json({ code: "CLASS_NOT_FOUND" }, { status: 404 });
  }

  const newSession = db
    .prepare(
      `
        SELECT
          id,
          class_id AS classId,
          teacher_id AS teacherId,
          title,
          description,
          date,
          start_time AS startTime,
          end_time AS endTime,
          slot_duration_minutes AS slotDurationMinutes,
          max_participants AS maxParticipants,
          0 AS bookedParticipants
        FROM booking_sessions
        WHERE id = ?
      `,
    )
    .get(result.lastInsertRowid);

  return NextResponse.json(newSession, { status: 201 });
}
