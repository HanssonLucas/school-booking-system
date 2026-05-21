"use client";

import { Box, Container, Typography } from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";
import BookingSessionList from "@/components/booking/BookingSessionList";
import { useState, useEffect } from "react";
import type { BookingSession } from "@/types/booking";
import BookSessionDialog from "@/components/booking/BookSessionDialog";

export default function StudentPage() {
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null,
  );
  const selectedSession = sessions.find(
    (session) => session.id === selectedSessionId,
  );
  useEffect(() => {
    const fetchSessions = async () => {
      const response = await fetch("/api/booking-sessions");

      if (!response.ok) {
        console.error("Kunde inte hämta bokningstillfällen");
        return;
      }

      const data: BookingSession[] = await response.json();

      setSessions(data);
    };

    fetchSessions();
  }, []);
  const handleBookSession = (sessionId: number) => {
    setSelectedSessionId(sessionId);
  };
  const handleSubmitBooking = async (
    studentName: string,
    studentEmail: string,
  ) => {
    if (!selectedSessionId) {
      return;
    }

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: selectedSessionId,
        studentName,
        studentEmail,
      }),
    });

    if (!response.ok) {
      console.error("Kunde inte boka plats");
      return;
    }

    setSessions((currentSessions) =>
      currentSessions.map((session) => {
        if (session.id !== selectedSessionId) {
          return session;
        }

        return {
          ...session,
          bookedParticipants: session.bookedParticipants + 1,
        };
      }),
    );

    setSelectedSessionId(null);
  };
  const handleCancelBooking = (sessionId: number) => {
    setSessions((currentSessions) =>
      currentSessions.map((session) => {
        if (session.id !== sessionId) {
          return session;
        }

        if (session.bookedParticipants <= 0) {
          return session;
        }

        return {
          ...session,
          bookedParticipants: session.bookedParticipants - 1,
        };
      }),
    );
  };
  return (
    <>
      <AppHeader />

      <Container sx={{ py: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Studentvy
          </Typography>

          <Typography color="text.secondary">
            Här kan du se kommande bokningstillfällen. Snart kommer du också
            kunna boka en plats och avboka dig.
          </Typography>
        </Box>

        <BookingSessionList
          sessions={sessions}
          showBookingButton
          showCancelButton
          onBookSession={handleBookSession}
          onCancelSession={handleCancelBooking}
        />
        <BookSessionDialog
          open={selectedSessionId !== null}
          sessionTitle={selectedSession?.title}
          onClose={() => setSelectedSessionId(null)}
          onSubmit={handleSubmitBooking}
        />
      </Container>
    </>
  );
}
