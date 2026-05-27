import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSlotTime } from "@/lib/BookingSlots";

export async function POST(request: Request) {
  const body = await request.json();

  const { sessionId, studentName, studentEmail } = body;

  if (!sessionId || !studentName || !studentEmail) {
    return NextResponse.json(
      { code: "MISSING_BOOKING_FIELDS" },
      { status: 400 },
    );
  }

  const session = db
    .prepare(
      `
      SELECT
        id,
        start_time AS startTime,
        max_participants AS maxParticipants
      FROM booking_sessions
      WHERE id = ?
      `,
    )
    .get(sessionId) as
    | { id: number; startTime: string; maxParticipants: number }
    | undefined;

  if (!session) {
    return NextResponse.json({ code: "SESSION_NOT_FOUND" }, { status: 404 });
  }

  const existingBooking = db
    .prepare(
      `
      SELECT id
      FROM bookings
      WHERE session_id = ?
        AND student_email = ?
      `,
    )
    .get(sessionId, studentEmail) as { id: number } | undefined;

  if (existingBooking) {
    return NextResponse.json(
      { code: "BOOKING_ALREADY_EXISTS" },
      { status: 409 },
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

  if (bookingCount.count >= session.maxParticipants) {
    return NextResponse.json({ code: "SESSION_FULL" }, { status: 409 });
  }

  const slotTime = getSlotTime(session.startTime, bookingCount.count);

  const result = db
    .prepare(
      `
      INSERT INTO bookings (
        session_id,
        student_name,
        student_email
      )
      VALUES (?, ?, ?)
      `,
    )
    .run(sessionId, studentName, studentEmail);

  const booking = db
    .prepare(
      `
    SELECT
      id,
      session_id AS sessionId,
      student_name AS studentName,
      student_email AS studentEmail,
      created_at AS createdAt
    FROM bookings
    WHERE id = ?
    `,
    )
    .get(result.lastInsertRowid) as {
    id: number;
    sessionId: number;
    studentName: string;
    studentEmail: string;
    createdAt: string;
  };

  return NextResponse.json(
    {
      ...booking,
      ...slotTime,
    },
    { status: 201 },
  );
}

export async function DELETE(request: Request) {
  const body = await request.json();

  const { sessionId, studentEmail } = body;

  if (!sessionId || !studentEmail) {
    return NextResponse.json(
      { code: "MISSING_CANCELLATION_FIELDS" },
      { status: 400 },
    );
  }

  const existingBooking = db
    .prepare(
      `
      SELECT id
      FROM bookings
      WHERE session_id = ?
        AND student_email = ?
      `,
    )
    .get(sessionId, studentEmail) as { id: number } | undefined;

  if (!existingBooking) {
    return NextResponse.json({ code: "BOOKING_NOT_FOUND" }, { status: 404 });
  }

  db.prepare(
    `
    DELETE FROM bookings
    WHERE id = ?
    `,
  ).run(existingBooking.id);

  return NextResponse.json({
    bookingId: existingBooking.id,
  });
}
