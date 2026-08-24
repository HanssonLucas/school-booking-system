import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  DEFAULT_SLOT_DURATION_MINUTES,
  getSlotCount,
} from "@/lib/bookingSlots";
import {
  requireTeacherOrResponse,
  requireVerifiedUserOrResponse,
} from "@/lib/apiAuth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireVerifiedUserOrResponse();

  if (authResult.response) {
    return authResult.response;
  }

  const teacher = authResult.user;

  if (teacher.role !== "teacher") {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await context.params;
  const sessionId = Number(id);

  if (!sessionId) {
    return NextResponse.json({ code: "INVALID_SESSION_ID" }, { status: 400 });
  }

  const body = await request.json();

  const {
    title,
    description,
    date,
    startTime,
    endTime,
    slotDurationMinutes = DEFAULT_SLOT_DURATION_MINUTES,
  } = body;

  if (!title || !date || !startTime || !endTime) {
    return NextResponse.json(
      { code: "MISSING_SESSION_FIELDS" },
      { status: 400 },
    );
  }

  const parsedSlotDurationMinutes = Number(slotDurationMinutes);

  if (!parsedSlotDurationMinutes || parsedSlotDurationMinutes <= 0) {
    return NextResponse.json(
      { code: "INVALID_SLOT_DURATION" },
      { status: 400 },
    );
  }

  const existingSession = db
    .prepare(
      `
      SELECT
        id,
        start_time AS startTime,
        end_time AS endTime,
        slot_duration_minutes AS slotDurationMinutes
      FROM booking_sessions
      WHERE id = ?
      `,
    )
    .get(sessionId) as
    | {
        id: number;
        startTime: string;
        endTime: string;
        slotDurationMinutes: number;
      }
    | undefined;

  if (!existingSession) {
    return NextResponse.json({ code: "SESSION_NOT_FOUND" }, { status: 404 });
  }

  const maxParticipants = getSlotCount(
    startTime,
    endTime,
    parsedSlotDurationMinutes,
  );

  if (maxParticipants <= 0) {
    return NextResponse.json(
      { code: "INVALID_SESSION_TIME_RANGE" },
      { status: 400 },
    );
  }

  const bookingCount = db
    .prepare(
      `
      SELECT COUNT(*) AS count
      FROM bookings
      WHERE session_id = ?
      `,
    )
    .get(sessionId) as { count: number };

  const hasBookings = bookingCount.count > 0;

  const isChangingSlotStructure =
    existingSession.startTime !== startTime ||
    existingSession.endTime !== endTime ||
    existingSession.slotDurationMinutes !== parsedSlotDurationMinutes;

  if (hasBookings && isChangingSlotStructure) {
    return NextResponse.json(
      { code: "CANNOT_CHANGE_SLOT_STRUCTURE_WITH_BOOKINGS" },
      { status: 409 },
    );
  }

  if (maxParticipants < bookingCount.count) {
    return NextResponse.json(
      { code: "TOO_FEW_SLOTS_FOR_EXISTING_BOOKINGS" },
      { status: 409 },
    );
  }

  db.prepare(
    `
    UPDATE booking_sessions
    SET
      title = ?,
      description = ?,
      date = ?,
      start_time = ?,
      end_time = ?,
      slot_duration_minutes = ?,
      max_participants = ?
    WHERE id = ?
    `,
  ).run(
    title,
    description ?? "",
    date,
    startTime,
    endTime,
    parsedSlotDurationMinutes,
    maxParticipants,
    sessionId,
  );

  const updatedSession = db
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
      WHERE booking_sessions.id = ?
      GROUP BY booking_sessions.id
      `,
    )
    .get(sessionId);

  return NextResponse.json(updatedSession);
}

export async function DELETE(request: Request, context: RouteContext) {
  const authResponse = await requireTeacherOrResponse();

  if (authResponse) {
    return authResponse;
  }
  const { id } = await context.params;
  const sessionId = Number(id);

  if (!sessionId) {
    return NextResponse.json({ code: "INVALID_SESSION_ID" }, { status: 400 });
  }

  const existingSession = db
    .prepare(
      `
      SELECT id
      FROM booking_sessions
      WHERE id = ?
      `,
    )
    .get(sessionId) as { id: number } | undefined;

  if (!existingSession) {
    return NextResponse.json({ code: "SESSION_NOT_FOUND" }, { status: 404 });
  }

  db.prepare(
    `
    DELETE FROM booking_sessions
    WHERE id = ?
    `,
  ).run(sessionId);

  return NextResponse.json({
    deletedSessionId: sessionId,
  });
}
