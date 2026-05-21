"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Container, Snackbar, Typography } from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";
import BookingSessionList from "@/components/booking/BookingSessionList";
import BookSessionDialog from "@/components/booking/BookSessionDialog";
import CancelBookingDialog from "@/components/booking/CancelBookingDialog";
import type { BookingSession } from "@/types/booking";

export default function StudentPage() {
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null,
  );
  const [cancelSessionId, setCancelSessionId] = useState<number | null>(null);

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
        message: "Inget bokningstillfälle är valt.",
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

      return {
        success: false,
        message: errorData.message ?? "Det gick inte att boka platsen.",
      };
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
    setSuccessMessage("Din plats har bokats.");
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
        message: "Inget bokningstillfälle är valt.",
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

      return {
        success: false,
        message: errorData.message ?? "Det gick inte att avboka platsen.",
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
    setSuccessMessage("Din bokning har avbokats.");
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
            Studentvy
          </Typography>

          <Typography color="text.secondary">
            Här kan du se kommande bokningstillfällen, boka en plats och avboka
            dig vid behov.
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
            Hämtar bokningstillfällen...
          </Typography>
        ) : (
          <BookingSessionList
            sessions={sessions}
            showBookingButton
            showCancelButton
            onBookSession={handleBookSession}
            onCancelSession={handleCancelBooking}
            emptyMessage="Det finns inga bokningstillfällen att boka just nu."
          />
        )}
      </Container>
    </>
  );
}
