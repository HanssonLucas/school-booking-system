import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSlotCount } from "@/lib/bookingSlots";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const sessionId = Number(id);

  if (!sessionId) {
    return NextResponse.json({ code: "INVALID_SESSION_ID" }, { status: 400 });
  }

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

  const bookingCount = db
    .prepare(
      `
    SELECT COUNT(*) AS count
    FROM bookings
    WHERE session_id = ?
    `,
    )
    .get(sessionId) as { count: number };

  if (maxParticipants < bookingCount.count) {
    return NextResponse.json(
      { code: "TOO_FEW_SLOTS_FOR_EXISTING_BOOKINGS" },
      { status: 409 },
    );
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
    UPDATE booking_sessions
    SET
      title = ?,
      description = ?,
      date = ?,
      start_time = ?,
      end_time = ?,
      max_participants = ?
    WHERE id = ?
    `,
  ).run(
    title,
    description ?? "",
    date,
    startTime,
    endTime,
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
