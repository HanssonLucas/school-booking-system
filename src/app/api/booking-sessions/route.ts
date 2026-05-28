import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSlotCount } from "@/lib/bookingSlots";
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
  const body = await request.json();

  const { title, description, date, startTime, endTime } = body;

  if (!title || !date || !startTime || !endTime) {
    return NextResponse.json(
      { code: "MISSING_SESSION_FIELDS" },
      { status: 400 },
    );
  }

  const maxParticipants = getSlotCount(startTime, endTime);

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
        max_participants
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
    )
    .run(title, description ?? "", date, startTime, endTime, maxParticipants);

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
        max_participants AS maxParticipants,
        0 AS bookedParticipants
      FROM booking_sessions
      WHERE id = ?
      `,
    )
    .get(result.lastInsertRowid);

  return NextResponse.json(newSession, { status: 201 });
}
