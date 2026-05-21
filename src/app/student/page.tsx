"use client";

import { Box, Container, Typography } from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";
import BookingSessionList from "@/components/booking/BookingSessionList";
import { mockBookingSessions } from "@/lib/mockBookingSessions";
import { useState } from "react";
import type { BookingSession } from "@/types/booking";

export default function StudentPage() {
  const [sessions, setSessions] =
    useState<BookingSession[]>(mockBookingSessions);
  const handleBookSession = (sessionId: number) => {
    setSessions((currentSessions) =>
      currentSessions.map((session) => {
        if (session.id !== sessionId) {
          return session;
        }

        if (session.bookedParticipants >= session.maxParticipants) {
          return session;
        }

        return {
          ...session,
          bookedParticipants: session.bookedParticipants + 1,
        };
      }),
    );
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
      </Container>
    </>
  );
}
