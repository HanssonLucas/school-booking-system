"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Container, Snackbar, Typography } from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";
import CreateBookingSessionForm from "@/components/booking/CreateBookingSessionForm";
import BookingSessionList from "@/components/booking/BookingSessionList";
import { useTranslations } from "@/i18n/useTranslations";
import type {
  BookingSession,
  CreateBookingSessionInput,
} from "@/types/booking";

export default function TeacherPage() {
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { t } = useTranslations();

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
      const errorData = await response.json();

      const errorMessages: Record<string, string> = {
        MISSING_SESSION_FIELDS: t.errors.missingSessionFields,
      };

      setErrorMessage(
        errorMessages[errorData.code] ??
          t.teacher.createFallbackError ??
          t.errors.unknown,
      );

      return;
    }

    const createdSession: BookingSession = await response.json();

    setSessions((currentSessions) => [createdSession, ...currentSessions]);
    setErrorMessage("");
    setSuccessMessage(t.teacher.createSuccess);
  };

  return (
    <>
      <AppHeader />

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={5000}
        onClose={() => setErrorMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setErrorMessage("")}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      <Container sx={{ py: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {t.teacher.title}
          </Typography>

          <Typography color="text.secondary">
            {t.teacher.description}
          </Typography>
        </Box>

        <CreateBookingSessionForm onCreateSession={handleCreateSession} />

        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            {t.teacher.sessionsTitle}
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {t.teacher.sessionsDescription}
          </Typography>

          {isLoading ? (
            <Typography color="text.secondary">
              {t.teacher.loadingSessions}
            </Typography>
          ) : (
            <BookingSessionList
              sessions={sessions}
              emptyMessage={t.teacher.emptySessions}
            />
          )}
        </Box>
      </Container>
    </>
  );
}
