import { NextResponse } from "next/server";
import { requireStudentOrResponse } from "@/lib/apiAuth";
import { db } from "@/lib/db";
import type { StudentBookingLookup } from "@/types/booking";

export async function GET() {
  const authResult = await requireStudentOrResponse();

  if (authResult.response) {
    return authResult.response;
  }

  const student = authResult.user;

  const bookings = db
    .prepare(
      `
      SELECT
        bookings.id,
        bookings.session_id AS sessionId,
        bookings.user_id AS userId,
        bookings.student_name AS studentName,
        bookings.student_email AS studentEmail,
        bookings.slot_start_time AS slotStartTime,
        bookings.slot_end_time AS slotEndTime,
        bookings.language,
        bookings.created_at AS createdAt,
        booking_sessions.title AS sessionTitle,
        booking_sessions.date AS sessionDate,
        booking_sessions.start_time AS sessionStartTime,
        booking_sessions.end_time AS sessionEndTime
      FROM bookings
      INNER JOIN booking_sessions
        ON booking_sessions.id = bookings.session_id
      WHERE bookings.user_id = ?
        OR bookings.student_email = ?
      ORDER BY booking_sessions.date ASC, bookings.slot_start_time ASC
      `,
    )
    .all(student.id, student.email) as StudentBookingLookup[];

  return NextResponse.json(bookings);
}
