import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();

  const { sessionId, studentName, studentEmail } = body;

  if (!sessionId || !studentName || !studentEmail) {
    return NextResponse.json(
      { message: "Session, namn och email krävs" },
      { status: 400 },
    );
  }

  const session = db
    .prepare(
      `
      SELECT
        id,
        max_participants AS maxParticipants
      FROM booking_sessions
      WHERE id = ?
      `,
    )
    .get(sessionId) as { id: number; maxParticipants: number } | undefined;

  if (!session) {
    return NextResponse.json(
      { message: "Bokningstillfället finns inte" },
      { status: 404 },
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

  if (existingBooking) {
    return NextResponse.json(
      { message: "Den här emailen är redan bokad på tillfället" },
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
    return NextResponse.json(
      { message: "Bokningstillfället är fullbokat" },
      { status: 409 },
    );
  }

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
    .get(result.lastInsertRowid);

  return NextResponse.json(booking, { status: 201 });
}

export async function DELETE(request: Request) {
  const body = await request.json();

  const { sessionId, studentEmail } = body;

  if (!sessionId || !studentEmail) {
    return NextResponse.json(
      { message: "Session och email krävs" },
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
    return NextResponse.json(
      { message: "Ingen bokning hittades för den emailen" },
      { status: 404 },
    );
  }

  db.prepare(
    `
    DELETE FROM bookings
    WHERE id = ?
    `,
  ).run(existingBooking.id);

  return NextResponse.json({
    message: "Bokningen har avbokats",
    bookingId: existingBooking.id,
  });
}
