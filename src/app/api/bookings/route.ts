import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAllSlotTimes } from "@/lib/bookingSlots";
import {
  notifyBookingCancelled,
  notifyBookingConfirmed,
} from "@/lib/emailNotifications";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = Number(searchParams.get("sessionId"));
  const studentEmail = searchParams.get("studentEmail");

  if (sessionId) {
    const session = db
      .prepare(
        `
        SELECT id
        FROM booking_sessions
        WHERE id = ?
        `,
      )
      .get(sessionId) as { id: number } | undefined;

    if (!session) {
      return NextResponse.json({ code: "SESSION_NOT_FOUND" }, { status: 404 });
    }

    const bookings = db
      .prepare(
        `
        SELECT
          id,
          session_id AS sessionId,
          student_name AS studentName,
          student_email AS studentEmail,
          slot_start_time AS slotStartTime,
          slot_end_time AS slotEndTime,
          created_at AS createdAt
        FROM bookings
        WHERE session_id = ?
        ORDER BY slot_start_time ASC, id ASC
        `,
      )
      .all(sessionId);

    return NextResponse.json(bookings);
  }

  if (studentEmail) {
    const bookings = db
      .prepare(
        `
        SELECT
          bookings.id,
          bookings.session_id AS sessionId,
          bookings.student_name AS studentName,
          bookings.student_email AS studentEmail,
          bookings.slot_start_time AS slotStartTime,
          bookings.slot_end_time AS slotEndTime,
          bookings.created_at AS createdAt,
          booking_sessions.title AS sessionTitle,
          booking_sessions.date AS sessionDate,
          booking_sessions.start_time AS sessionStartTime,
          booking_sessions.end_time AS sessionEndTime,
          booking_sessions.slot_duration_minutes AS slotDurationMinutes
        FROM bookings
        INNER JOIN booking_sessions
          ON booking_sessions.id = bookings.session_id
        WHERE bookings.student_email = ?
        ORDER BY booking_sessions.date ASC, bookings.slot_start_time ASC
        `,
      )
      .all(studentEmail);

    return NextResponse.json(bookings);
  }

  return NextResponse.json({ code: "MISSING_BOOKINGS_QUERY" }, { status: 400 });
}

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
        title,
        date,
        start_time AS startTime,
        end_time AS endTime,
        slot_duration_minutes AS slotDurationMinutes,
        max_participants AS maxParticipants
      FROM booking_sessions
      WHERE id = ?
      `,
    )
    .get(sessionId) as
    | {
        id: number;
        title: string;
        date: string;
        startTime: string;
        endTime: string;
        slotDurationMinutes: number;
        maxParticipants: number;
      }
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

  const bookedSlots = db
    .prepare(
      `
      SELECT
        slot_start_time AS slotStartTime,
        slot_end_time AS slotEndTime
      FROM bookings
      WHERE session_id = ?
      `,
    )
    .all(sessionId) as {
    slotStartTime: string;
    slotEndTime: string;
  }[];

  const allSlots = getAllSlotTimes(
    session.startTime,
    session.endTime,
    session.slotDurationMinutes,
  );

  const firstAvailableSlot = allSlots.find(
    (slot) =>
      !bookedSlots.some(
        (bookedSlot) =>
          bookedSlot.slotStartTime === slot.slotStartTime &&
          bookedSlot.slotEndTime === slot.slotEndTime,
      ),
  );

  if (!firstAvailableSlot) {
    return NextResponse.json({ code: "SESSION_FULL" }, { status: 409 });
  }

  const result = db
    .prepare(
      `
      INSERT INTO bookings (
        session_id,
        student_name,
        student_email,
        slot_start_time,
        slot_end_time
      )
      VALUES (?, ?, ?, ?, ?)
      `,
    )
    .run(
      sessionId,
      studentName,
      studentEmail,
      firstAvailableSlot.slotStartTime,
      firstAvailableSlot.slotEndTime,
    );

  const booking = db
    .prepare(
      `
      SELECT
        id,
        session_id AS sessionId,
        student_name AS studentName,
        student_email AS studentEmail,
        slot_start_time AS slotStartTime,
        slot_end_time AS slotEndTime,
        created_at AS createdAt
      FROM bookings
      WHERE id = ?
      `,
    )
    .get(result.lastInsertRowid) as
    | {
        id: number;
        sessionId: number;
        studentName: string;
        studentEmail: string;
        slotStartTime: string;
        slotEndTime: string;
        createdAt: string;
      }
    | undefined;

  if (!booking) {
    return NextResponse.json({ code: "BOOKING_NOT_FOUND" }, { status: 500 });
  }

  await notifyBookingConfirmed({
    to: booking.studentEmail,
    studentName: booking.studentName,
    sessionTitle: session.title,
    sessionDate: session.date,
    slotStartTime: booking.slotStartTime,
    slotEndTime: booking.slotEndTime,
  });

  return NextResponse.json(booking, { status: 201 });
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
      SELECT
        bookings.id,
        bookings.session_id AS sessionId,
        bookings.student_name AS studentName,
        bookings.student_email AS studentEmail,
        bookings.slot_start_time AS slotStartTime,
        bookings.slot_end_time AS slotEndTime,
        booking_sessions.title AS sessionTitle,
        booking_sessions.date AS sessionDate
      FROM bookings
      INNER JOIN booking_sessions
        ON booking_sessions.id = bookings.session_id
      WHERE bookings.session_id = ?
        AND bookings.student_email = ?
      `,
    )
    .get(sessionId, studentEmail) as
    | {
        id: number;
        sessionId: number;
        studentName: string;
        studentEmail: string;
        slotStartTime: string;
        slotEndTime: string;
        sessionTitle: string;
        sessionDate: string;
      }
    | undefined;

  if (!existingBooking) {
    return NextResponse.json({ code: "BOOKING_NOT_FOUND" }, { status: 404 });
  }

  db.prepare(
    `
    DELETE FROM bookings
    WHERE id = ?
    `,
  ).run(existingBooking.id);

  await notifyBookingCancelled({
    to: existingBooking.studentEmail,
    studentName: existingBooking.studentName,
    sessionTitle: existingBooking.sessionTitle,
    sessionDate: existingBooking.sessionDate,
    slotStartTime: existingBooking.slotStartTime,
    slotEndTime: existingBooking.slotEndTime,
  });

  return NextResponse.json({
    bookingId: existingBooking.id,
  });
}
