"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Typography,
} from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";
import CreateBookingSessionForm from "@/components/booking/CreateBookingSessionForm";
import EditBookingSessionDialog, {
  type EditFormValues,
} from "@/components/booking/EditBookingSessionDialog";
import BookingSessionList from "@/components/booking/BookingSessionList";
import { useTranslations } from "@/i18n/useTranslations";
import type {
  BookingSession,
  CreateBookingSessionInput,
} from "@/types/booking";
import ViewBookingsDialog from "@/components/booking/ViewBookingsDialog";

export default function TeacherPage() {
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewBookingsSessionId, setViewBookingsSessionId] = useState<
    number | null
  >(null);
  const [deleteSessionId, setDeleteSessionId] = useState<number | null>(null);

  const { t } = useTranslations();

  const deleteSession = sessions.find(
    (session) => session.id === deleteSessionId,
  );

  const viewBookingsSession = sessions.find(
    (session) => session.id === viewBookingsSessionId,
  );

  const editingSession = sessions.find(
    (session) => session.id === editingSessionId,
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
    setIsCreateDialogOpen(false);
    setErrorMessage("");
    setSuccessMessage(t.teacher.createSuccess);
  };

  const handleEditSession = (sessionId: number) => {
    setEditingSessionId(sessionId);
  };

  const handleSaveSession = async (
    sessionId: number,
    values: EditFormValues,
  ) => {
    const response = await fetch(`/api/booking-sessions/${sessionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: values.title,
        description: values.description,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        maxParticipants: Number(values.maxParticipants),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();

      const errorMessages: Record<string, string> = {
        INVALID_SESSION_ID: t.errors.sessionNotFound,
        MISSING_SESSION_FIELDS: t.errors.missingSessionFields,
        SESSION_NOT_FOUND: t.errors.sessionNotFound,
        INVALID_SESSION_TIME_RANGE: t.errors.invalidSessionTimeRange,
        TOO_FEW_SLOTS_FOR_EXISTING_BOOKINGS:
          t.errors.tooFewSlotsForExistingBookings,
      };

      setErrorMessage(
        errorMessages[errorData.code] ??
          t.teacher.updateFallbackError ??
          t.errors.unknown,
      );

      return;
    }

    const updatedSession: BookingSession = await response.json();

    setSessions((currentSessions) =>
      currentSessions.map((session) =>
        session.id === sessionId ? updatedSession : session,
      ),
    );

    setEditingSessionId(null);
    setErrorMessage("");
    setSuccessMessage(t.teacher.updateSuccess);
  };

  const handleViewBookings = (sessionId: number) => {
    setViewBookingsSessionId(sessionId);
  };

  const handleDeleteSessionClick = (sessionId: number) => {
    setDeleteSessionId(sessionId);
  };

  const handleConfirmDeleteSession = async () => {
    if (!deleteSessionId) {
      return;
    }

    const response = await fetch(`/api/booking-sessions/${deleteSessionId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();

      const errorMessages: Record<string, string> = {
        INVALID_SESSION_ID: t.errors.sessionNotFound,
        SESSION_NOT_FOUND: t.errors.sessionNotFound,
      };

      setErrorMessage(
        errorMessages[errorData.code] ??
          t.teacher.deleteFallbackError ??
          t.errors.unknown,
      );

      return;
    }

    setSessions((currentSessions) =>
      currentSessions.filter((session) => session.id !== deleteSessionId),
    );

    setDeleteSessionId(null);
    setErrorMessage("");
    setSuccessMessage(t.teacher.deleteSuccess);
  };

  return (
    <>
      <AppHeader />

      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <CreateBookingSessionForm onCreateSession={handleCreateSession} />
        </DialogContent>
      </Dialog>

      <EditBookingSessionDialog
        open={editingSessionId !== null}
        session={editingSession ?? null}
        onClose={() => setEditingSessionId(null)}
        onSave={handleSaveSession}
      />

      <ViewBookingsDialog
        open={viewBookingsSessionId !== null}
        session={viewBookingsSession ?? null}
        onClose={() => setViewBookingsSessionId(null)}
      />

      <Dialog
        open={deleteSessionId !== null}
        onClose={() => setDeleteSessionId(null)}
      >
        <DialogTitle>{t.deleteSessionDialog.title}</DialogTitle>

        <DialogContent>
          <DialogContentText>
            {t.deleteSessionDialog.descriptionStart}{" "}
            <strong>{deleteSession?.title}</strong>?{" "}
            {t.deleteSessionDialog.descriptionEnd}
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteSessionId(null)}>
            {t.deleteSessionDialog.cancelButton}
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDeleteSession}
          >
            {t.deleteSessionDialog.deleteButton}
          </Button>
        </DialogActions>
      </Dialog>

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

        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            {t.teacher.createSessionButton}
          </Button>
        </Box>

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
              showEditButton
              showViewBookingsButton
              showDeleteButton
              onEditSession={handleEditSession}
              onViewBookingsSession={handleViewBookings}
              onDeleteSession={handleDeleteSessionClick}
              emptyMessage={t.teacher.emptySessions}
            />
          )}
        </Box>
      </Container>
    </>
  );
}
