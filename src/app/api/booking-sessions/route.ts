import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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
