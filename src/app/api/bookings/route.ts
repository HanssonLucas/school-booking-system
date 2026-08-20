import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAllSlotTimes } from "@/lib/bookingSlots";
import {
  notifyBookingCancelled,
  notifyBookingConfirmed,
} from "@/lib/emailNotifications";
import type { BookingLanguage } from "@/types/booking";
import {
  requireStudentOrResponse,
  requireTeacherOrResponse,
  requireVerifiedUserOrResponse,
} from "@/lib/apiAuth";

const getValidBookingLanguage = (language: unknown): BookingLanguage => {
  return language === "en" ? "en" : "sv";
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = Number(searchParams.get("sessionId"));

  if (sessionId) {
    const authResponse = await requireTeacherOrResponse();

    if (authResponse) {
      return authResponse;
    }

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
          user_id AS userId,
          student_name AS studentName,
          student_email AS studentEmail,
          slot_start_time AS slotStartTime,
          slot_end_time AS slotEndTime,
          language,
          created_at AS createdAt
        FROM bookings
        WHERE session_id = ?
        ORDER BY slot_start_time ASC, id ASC
        `,
      )
      .all(sessionId);

    return NextResponse.json(bookings);
  }

  return NextResponse.json({ code: "MISSING_BOOKINGS_QUERY" }, { status: 400 });
}

export async function POST(request: Request) {
  const authResult = await requireVerifiedUserOrResponse();

  if (authResult.response) {
    return authResult.response;
  }

  const student = authResult.user;

  if (student.role !== "student") {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }
  const body = await request.json();

  const { sessionId } = body;
  const language = getValidBookingLanguage(body.language);

  if (!sessionId) {
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
        AND (user_id = ? OR student_email = ?)
      `,
    )
    .get(sessionId, student.id, student.email) as { id: number } | undefined;

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
        user_id,
        student_name,
        student_email,
        slot_start_time,
        slot_end_time,
        language
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(
      sessionId,
      student.id,
      student.name,
      student.email,
      firstAvailableSlot.slotStartTime,
      firstAvailableSlot.slotEndTime,
      language,
    );

  const booking = db
    .prepare(
      `
      SELECT
        id,
        session_id AS sessionId,
        user_id AS userId,
        student_name AS studentName,
        student_email AS studentEmail,
        slot_start_time AS slotStartTime,
        slot_end_time AS slotEndTime,
        language,
        created_at AS createdAt
      FROM bookings
      WHERE id = ?
      `,
    )
    .get(result.lastInsertRowid) as
    | {
        id: number;
        sessionId: number;
        userId: number;
        studentName: string;
        studentEmail: string;
        slotStartTime: string;
        slotEndTime: string;
        language: BookingLanguage;
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
    language: booking.language,
  });

  return NextResponse.json(booking, { status: 201 });
}

export async function DELETE(request: Request) {
  const authResult = await requireStudentOrResponse();

  if (authResult.response) {
    return authResult.response;
  }

  const student = authResult.user;
  const body = await request.json();

  const { sessionId } = body;

  if (!sessionId) {
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
        bookings.language,
        booking_sessions.title AS sessionTitle,
        booking_sessions.date AS sessionDate
      FROM bookings
      INNER JOIN booking_sessions
        ON booking_sessions.id = bookings.session_id
      WHERE bookings.session_id = ?
        AND (bookings.user_id = ? OR bookings.student_email = ?)
      `,
    )
    .get(sessionId, student.id, student.email) as
    | {
        id: number;
        sessionId: number;
        studentName: string;
        studentEmail: string;
        slotStartTime: string;
        slotEndTime: string;
        language: BookingLanguage;
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
    language: existingBooking.language,
  });

  return NextResponse.json({
    bookingId: existingBooking.id,
  });
}
