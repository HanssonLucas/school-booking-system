"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogContent,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AppHeader from "@/components/layout/AppHeader";
import CreateBookingSessionForm from "@/components/booking/CreateBookingSessionForm";
import EditBookingSessionDialog, {
  type EditFormValues,
} from "@/components/booking/EditBookingSessionDialog";
import BookingSessionList from "@/components/booking/BookingSessionList";
import SessionFilterControls from "@/components/booking/SessionFilterControls";
import { useTranslations } from "@/i18n/useTranslations";
import type {
  BookingSession,
  CreateBookingSessionInput,
} from "@/types/booking";
import ViewBookingsDialog from "@/components/booking/ViewBookingsDialog";
import DeleteBookingSessionDialog from "@/components/booking/DeleteBookingSessionDialog";

type SortOption = "dateAsc" | "dateDesc" | "bookedFirst";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyFull, setShowOnlyFull] = useState(false);
  const [showOnlyWithBookings, setShowOnlyWithBookings] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("dateAsc");

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

  const filteredSessions = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    return [...sessions]
      .filter((session) => {
        const slotsLeft = session.maxParticipants - session.bookedParticipants;
        const isFull = slotsLeft === 0;
        const hasBookings = session.bookedParticipants > 0;

        const matchesFullFilter = !showOnlyFull || isFull;
        const matchesBookingsFilter = !showOnlyWithBookings || hasBookings;

        const searchableText = [
          session.title,
          session.description,
          session.date,
          session.startTime,
          session.endTime,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !normalizedSearchQuery ||
          searchableText.includes(normalizedSearchQuery);

        return matchesFullFilter && matchesBookingsFilter && matchesSearch;
      })
      .sort((firstSession, secondSession) => {
        const firstDateTime = `${firstSession.date}T${firstSession.startTime}`;
        const secondDateTime = `${secondSession.date}T${secondSession.startTime}`;

        if (sortOption === "dateDesc") {
          return secondDateTime.localeCompare(firstDateTime);
        }

        if (sortOption === "bookedFirst") {
          if (
            firstSession.bookedParticipants !== secondSession.bookedParticipants
          ) {
            return (
              secondSession.bookedParticipants - firstSession.bookedParticipants
            );
          }

          return firstDateTime.localeCompare(secondDateTime);
        }

        return firstDateTime.localeCompare(secondDateTime);
      });
  }, [sessions, searchQuery, showOnlyFull, showOnlyWithBookings, sortOption]);

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

  useEffect(() => {
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
        slotDurationMinutes: Number(values.slotDurationMinutes),
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
        CANNOT_CHANGE_SLOT_STRUCTURE_WITH_BOOKINGS:
          t.errors.cannotChangeSlotStructureWithBookings,
        INVALID_SLOT_DURATION: t.errors.invalidSlotDuration,
      };

      setErrorMessage(
        errorMessages[errorData.code] ??
          t.teacher.updateFallbackError ??
          t.errors.unknown,
      );

      return;
    }

    await fetchSessions();

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

      <DeleteBookingSessionDialog
        open={deleteSessionId !== null}
        sessionTitle={deleteSession?.title}
        onClose={() => setDeleteSessionId(null)}
        onConfirm={handleConfirmDeleteSession}
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
              "linear-gradient(135deg, rgba(156, 39, 176, 0.14), rgba(25, 118, 210, 0.08))",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: "50%",
              bgcolor: "secondary.main",
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
              bgcolor: "primary.main",
              opacity: 0.1,
              right: 120,
              bottom: -80,
            }}
          />

          <Box sx={{ position: "relative", maxWidth: 760 }}>
            <Chip
              icon={<EditCalendarOutlinedIcon />}
              label={t.common.teacher}
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
              {t.teacher.title}
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
              {t.teacher.description}
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddRoundedIcon />}
                onClick={() => setIsCreateDialogOpen(true)}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                  px: 3,
                  py: 1.3,
                }}
              >
                {t.teacher.createSessionButton}
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<VisibilityOutlinedIcon />}
                onClick={() => {
                  document
                    .getElementById("teacher-sessions")
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
                {t.teacher.sessionsTitle}
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
                icon={<AddRoundedIcon />}
                label={t.teacher.createSessionButton}
                variant="outlined"
                sx={{ borderRadius: 999, bgcolor: "background.paper" }}
              />

              <Chip
                icon={<EditOutlinedIcon />}
                label={t.bookingSession.editButton}
                variant="outlined"
                sx={{ borderRadius: 999, bgcolor: "background.paper" }}
              />

              <Chip
                icon={<VisibilityOutlinedIcon />}
                label={t.bookingSession.viewBookingsButton}
                variant="outlined"
                sx={{ borderRadius: 999, bgcolor: "background.paper" }}
              />

              <Chip
                icon={<DeleteOutlineOutlinedIcon />}
                label={t.bookingSession.deleteButton}
                variant="outlined"
                sx={{ borderRadius: 999, bgcolor: "background.paper" }}
              />
            </Stack>
          </Box>
        </Paper>

        <Paper
          id="teacher-sessions"
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
              {t.teacher.sessionsTitle}
            </Typography>

            <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
              {t.teacher.sessionsDescription}
            </Typography>
          </Box>

          <SessionFilterControls
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            sortOption={sortOption}
            onSortOptionChange={(value) => setSortOption(value as SortOption)}
            sortOptions={[
              {
                value: "dateAsc",
                label: t.sessionFilters.sortDateAsc,
              },
              {
                value: "dateDesc",
                label: t.sessionFilters.sortDateDesc,
              },
              {
                value: "bookedFirst",
                label: t.sessionFilters.sortBookedFirst,
              },
            ]}
            switches={[
              {
                key: "onlyFull",
                label: t.sessionFilters.onlyFull,
                checked: showOnlyFull,
                onChange: setShowOnlyFull,
              },
              {
                key: "onlyWithBookings",
                label: t.sessionFilters.onlyWithBookings,
                checked: showOnlyWithBookings,
                onChange: setShowOnlyWithBookings,
              },
            ]}
            visibleCount={filteredSessions.length}
            totalCount={sessions.length}
          />

          {isLoading ? (
            <Typography color="text.secondary">
              {t.teacher.loadingSessions}
            </Typography>
          ) : (
            <BookingSessionList
              sessions={filteredSessions}
              showEditButton
              showViewBookingsButton
              showDeleteButton
              onEditSession={handleEditSession}
              onViewBookingsSession={handleViewBookings}
              onDeleteSession={handleDeleteSessionClick}
              emptyMessage={
                sessions.length === 0
                  ? t.teacher.emptySessions
                  : t.sessionFilters.noMatchingSessions
              }
            />
          )}
        </Paper>
      </Container>
    </>
  );
}
