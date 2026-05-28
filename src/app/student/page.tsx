"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AppHeader from "@/components/layout/AppHeader";
import BookingSessionList from "@/components/booking/BookingSessionList";
import BookSessionDialog from "@/components/booking/BookSessionDialog";
import CancelBookingDialog from "@/components/booking/CancelBookingDialog";
import MyBookingsDialog from "@/components/booking/MyBookingsDialog";
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
  const [isMyBookingsDialogOpen, setIsMyBookingsDialogOpen] = useState(false);

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

      <MyBookingsDialog
        open={isMyBookingsDialogOpen}
        onClose={() => setIsMyBookingsDialogOpen(false)}
      />

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

      <Container sx={{ py: { xs: 4, md: 7 } }}>
        <Paper
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 6,
            p: { xs: 3, sm: 5 },
            mb: 5,
            border: 1,
            borderColor: "divider",
            background:
              "linear-gradient(135deg, rgba(25, 118, 210, 0.14), rgba(76, 175, 80, 0.08))",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: "50%",
              bgcolor: "primary.main",
              opacity: 0.12,
              right: -70,
              top: -80,
            }}
          />

          <Box
            sx={{
              position: "absolute",
              width: 160,
              height: 160,
              borderRadius: "50%",
              bgcolor: "success.main",
              opacity: 0.1,
              right: 120,
              bottom: -80,
            }}
          />

          <Box sx={{ position: "relative", maxWidth: 760 }}>
            <Chip
              icon={<EventAvailableOutlinedIcon />}
              label={t.common.student}
              sx={{
                mb: 3,
                borderRadius: 999,
                fontWeight: 800,
                bgcolor: "background.paper",
              }}
            />

            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 900,
                letterSpacing: -1.3,
                lineHeight: 1.05,
                fontSize: { xs: "2.25rem", md: "3.5rem" },
                mb: 2,
              }}
            >
              {t.student.title}
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                lineHeight: 1.7,
                maxWidth: 680,
                mb: 4,
              }}
            >
              {t.student.description}
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={<SearchOutlinedIcon />}
                onClick={() => setIsMyBookingsDialogOpen(true)}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                  px: 3,
                  py: 1.3,
                }}
              >
                {t.myBookingsDialog.openButton}
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<EventAvailableOutlinedIcon />}
                onClick={() => {
                  document
                    .getElementById("available-sessions")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                  px: 3,
                  py: 1.3,
                  bgcolor: "background.paper",
                }}
              >
                {t.home.upcomingSessionsTitle}
              </Button>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{
                flexWrap: "wrap",
                mt: 4,
              }}
            >
              <Chip
                icon={<AccessTimeOutlinedIcon />}
                label={t.bookingSession.slotDuration}
                variant="outlined"
                sx={{ borderRadius: 999, bgcolor: "background.paper" }}
              />

              <Chip
                icon={<SearchOutlinedIcon />}
                label={t.myBookingsDialog.openButton}
                variant="outlined"
                sx={{ borderRadius: 999, bgcolor: "background.paper" }}
              />

              <Chip
                icon={<CancelOutlinedIcon />}
                label={t.bookingSession.cancelButton}
                variant="outlined"
                sx={{ borderRadius: 999, bgcolor: "background.paper" }}
              />
            </Stack>
          </Box>
        </Paper>

        <Paper
          id="available-sessions"
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 5,
            border: 1,
            borderColor: "divider",
            boxShadow: 1,
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{ fontWeight: 850, letterSpacing: -0.5 }}
              gutterBottom
            >
              {t.home.upcomingSessionsTitle}
            </Typography>

            <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
              {t.home.upcomingSessionsDescription}
            </Typography>
          </Box>

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
        </Paper>
      </Container>
    </>
  );
}
