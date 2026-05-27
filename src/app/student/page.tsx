"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Container, Snackbar, Typography } from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";
import BookingSessionList from "@/components/booking/BookingSessionList";
import BookSessionDialog from "@/components/booking/BookSessionDialog";
import CancelBookingDialog from "@/components/booking/CancelBookingDialog";
import type { BookingSession } from "@/types/booking";
import { useTranslations } from "@/i18n/useTranslations";

export default function StudentPage() {
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null,
  );
  const [cancelSessionId, setCancelSessionId] = useState<number | null>(null);

  const { t } = useTranslations();

  const selectedSession = sessions.find(
    (session) => session.id === selectedSessionId,
  );

  const cancelSession = sessions.find(
    (session) => session.id === cancelSessionId,
  );

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

  const handleBookSession = (sessionId: number) => {
    setSelectedSessionId(sessionId);
  };

  const handleSubmitBooking = async (
    studentName: string,
    studentEmail: string,
  ) => {
    if (!selectedSessionId) {
      return {
        success: false,
        message: t.student.noSelectedSession,
      };
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
      const errorData = await response.json();

      const errorMessages: Record<string, string> = {
        MISSING_BOOKING_FIELDS: t.errors.missingBookingFields,
        SESSION_NOT_FOUND: t.errors.sessionNotFound,
        BOOKING_ALREADY_EXISTS: t.errors.bookingAlreadyExists,
        SESSION_FULL: t.errors.sessionFull,
      };

      return {
        success: false,
        message:
          errorMessages[errorData.code] ??
          t.student.bookingFallbackError ??
          t.errors.unknown,
      };
    }

    const bookingResult: {
      slotStartTime?: string;
      slotEndTime?: string;
    } = await response.json();

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
    if (bookingResult.slotStartTime && bookingResult.slotEndTime) {
      setSuccessMessage(
        `${t.student.bookingSuccessWithTime} ${bookingResult.slotStartTime}–${bookingResult.slotEndTime}`,
      );
    } else {
      setSuccessMessage(t.student.bookingSuccess);
    }

    return {
      success: true,
    };
  };

  const handleCancelBooking = (sessionId: number) => {
    setCancelSessionId(sessionId);
  };

  const handleSubmitCancellation = async (studentEmail: string) => {
    if (!cancelSessionId) {
      return {
        success: false,
        message: t.student.noSelectedSession,
      };
    }

    const response = await fetch("/api/bookings", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: cancelSessionId,
        studentEmail,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();

      const errorMessages: Record<string, string> = {
        MISSING_CANCELLATION_FIELDS: t.errors.missingCancellationFields,
        BOOKING_NOT_FOUND: t.errors.bookingNotFound,
      };

      return {
        success: false,
        message:
          errorMessages[errorData.code] ??
          t.student.cancellationFallbackError ??
          t.errors.unknown,
      };
    }

    setSessions((currentSessions) =>
      currentSessions.map((session) => {
        if (session.id !== cancelSessionId) {
          return session;
        }

        return {
          ...session,
          bookedParticipants: Math.max(0, session.bookedParticipants - 1),
        };
      }),
    );

    setCancelSessionId(null);
    setSuccessMessage(t.student.cancellationSuccess);

    return {
      success: true,
    };
  };

  return (
    <>
      <AppHeader />

      <BookSessionDialog
        open={selectedSessionId !== null}
        sessionTitle={selectedSession?.title}
        onClose={() => setSelectedSessionId(null)}
        onSubmit={handleSubmitBooking}
      />

      <CancelBookingDialog
        open={cancelSessionId !== null}
        sessionTitle={cancelSession?.title}
        onClose={() => setCancelSessionId(null)}
        onSubmit={handleSubmitCancellation}
      />

      <Container sx={{ py: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {t.student.title}
          </Typography>

          <Typography color="text.secondary">
            {t.student.description}
          </Typography>
        </Box>

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

        {isLoading ? (
          <Typography color="text.secondary">
            {t.student.loadingSessions}
          </Typography>
        ) : (
          <BookingSessionList
            sessions={sessions}
            showBookingButton
            showCancelButton
            onBookSession={handleBookSession}
            onCancelSession={handleCancelBooking}
            emptyMessage={t.student.emptySessions}
          />
        )}
      </Container>
    </>
  );
}
