"use client";

import { useEffect, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";
import CreateBookingSessionForm from "@/components/booking/CreateBookingSessionForm";
import BookingSessionList from "@/components/booking/BookingSessionList";
import type {
  BookingSession,
  CreateBookingSessionInput,
} from "@/types/booking";

export default function TeacherPage() {
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/booking-sessions");

        if (!response.ok) {
          console.error("Kunde inte hämta bokningstillfällen");
          return;
        }

        const data: BookingSession[] = await response.json();
        setSessions(data);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleCreateSession = async (newSession: CreateBookingSessionInput) => {
    const response = await fetch("/api/booking-sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newSession),
    });

    if (!response.ok) {
      console.error("Kunde inte skapa bokningstillfälle");
      return;
    }

    const createdSession: BookingSession = await response.json();

    setSessions((currentSessions) => [createdSession, ...currentSessions]);
  };

  return (
    <>
      <AppHeader />

      <Container sx={{ py: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Lärarvy
          </Typography>

          <Typography color="text.secondary">
            Här kan lärare skapa bokningstillfällen för handledning och muntliga
            redovisningar.
          </Typography>
        </Box>

        <CreateBookingSessionForm onCreateSession={handleCreateSession} />

        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Bokningstillfällen
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Här visas tillfällen som läraren har skapat.
          </Typography>

          {isLoading ? (
            <Typography color="text.secondary">
              Hämtar bokningstillfällen...
            </Typography>
          ) : (
            <BookingSessionList
              sessions={sessions}
              emptyMessage="Du har inte skapat några bokningstillfällen ännu."
            />
          )}
        </Box>
      </Container>
    </>
  );
}
