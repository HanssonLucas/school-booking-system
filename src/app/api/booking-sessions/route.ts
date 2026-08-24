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
        max_participants
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(
      title,
      description ?? "",
      date,
      startTime,
      endTime,
      parsedSlotDurationMinutes,
      maxParticipants,
    );

  const newSession = db
    .prepare(
      `
      SELECT
        id,
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
