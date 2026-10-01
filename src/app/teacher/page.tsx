"use client";

import { Suspense, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Container,
  Dialog,
  DialogContent,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AppHeader from "@/components/layout/AppHeader";
import CreateBookingSessionForm from "@/components/booking/CreateBookingSessionForm";
import EditBookingSessionDialog, {
  type EditFormValues,
} from "@/components/booking/EditBookingSessionDialog";
import TeacherSessionsOverview from "@/components/booking/TeacherSessionsOverview";
import { useTranslations } from "@/i18n/useTranslations";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useAuth } from "@/components/auth/useAuth";
import type {
  BookingSession,
  CreateBookingSessionInput,
} from "@/types/booking";
import ViewBookingsDialog from "@/components/booking/ViewBookingsDialog";
import DeleteBookingSessionDialog from "@/components/booking/DeleteBookingSessionDialog";
import TeacherRouteGuard from "@/components/auth/TeacherRouteGuard";
import SessionDialogHeader from "@/components/booking/SessionDialogHeader";

type TeacherSession = BookingSession & { classId: number };

async function requestTeacherSessions(
  signal?: AbortSignal,
): Promise<TeacherSession[]> {
  const response = await fetch("/api/booking-sessions", {
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error("Could not load sessions");
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error("Invalid sessions response");
  return data as TeacherSession[];
}

export default function TeacherPage() {
  const { t } = useTranslations();

  return (
    <>
      <AppHeader />

      <TeacherRouteGuard>
        <Suspense
          fallback={
            <Container sx={{ py: 4 }}>
              <Typography color="text.secondary">
                {t.auth.loadingUser}
              </Typography>
            </Container>
          }
        >
          <TeacherPageContent />
        </Suspense>
      </TeacherRouteGuard>
    </>
  );
}

function TeacherPageContent() {
  const [sessions, setSessions] = useState<TeacherSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);

  const [viewBookingsSessionId, setViewBookingsSessionId] = useState<
    number | null
  >(null);
  const [deleteSessionId, setDeleteSessionId] = useState<number | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const classFilterValues = searchParams.getAll("classId");
  const rawClassId = classFilterValues[0] ?? "";
  const selectedClassId =
    classFilterValues.length === 1 &&
    /^[1-9]\d*$/.test(rawClassId) &&
    Number.isSafeInteger(Number(rawClassId))
      ? Number(rawClassId)
      : null;

  const isCreateDialogOpen = searchParams.get("dialog") === "create-session";

  const openCreateDialog = () => {
    const params = new URLSearchParams(window.location.search);
    params.set("dialog", "create-session");

    router.push(`${pathname}?${params.toString()}${window.location.hash}`, {
      scroll: false,
    });
  };

  const closeCreateDialog = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("dialog");

    const query = params.toString();

    router.replace(
      `${pathname}${query ? `?${query}` : ""}${window.location.hash}`,
      { scroll: false },
    );
  };
  const { user: currentUser } = useAuth();

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

  const fetchSessions = async () => {
    try {
      const data = await requestTeacherSessions();
      setSessions(data);
      setLoadFailed(false);
    } catch {
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void requestTeacherSessions(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setSessions(data);
          setLoadFailed(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadFailed(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
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
        EMAIL_NOT_VERIFIED: t.auth.teacherEmailVerificationRequired,
        MISSING_SESSION_FIELDS: t.errors.missingSessionFields,
      };

      setErrorMessage(
        errorMessages[errorData.code] ??
          t.teacher.createFallbackError ??
          t.errors.unknown,
      );

      return;
    }

    const createdSession: TeacherSession = await response.json();

    setSessions((currentSessions) => [createdSession, ...currentSessions]);
    closeCreateDialog();
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
        EMAIL_NOT_VERIFIED: t.auth.teacherEmailVerificationRequired,
      };

      setErrorMessage(
        errorMessages[errorData.code] ??
          t.teacher.updateFallbackError ??
          t.errors.unknown,
      );

      return;
    }

    setIsLoading(true);
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
        EMAIL_NOT_VERIFIED: t.auth.teacherEmailVerificationRequired,
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
      <Dialog
        open={isCreateDialogOpen}
        onClose={closeCreateDialog}
        maxWidth={currentUser?.emailVerified === false ? "sm" : "md"}
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              overflow: "hidden",
              border: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              backgroundImage: "none",
              maxWidth: currentUser?.emailVerified === false ? 600 : 720,
            },
          },
        }}
      >
        {currentUser && !currentUser.emailVerified ? (
          <>
            <SessionDialogHeader
              title={t.teacher.createSessionButton}
              icon={<AddRoundedIcon />}
            />

            <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Stack spacing={3}>
                <Alert severity="warning" sx={{ borderRadius: 3 }}>
                  {t.auth.teacherEmailVerificationRequired}
                </Alert>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    justifyContent: "flex-end",
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    onClick={closeCreateDialog}
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 800,
                      px: 2.5,
                    }}
                  >
                    {t.bookSessionDialog.cancelButton}
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<PersonOutlineOutlinedIcon />}
                    onClick={() => router.push("/profile")}
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 800,
                      px: 2.5,
                    }}
                  >
                    {t.profile.title}
                  </Button>
                </Stack>
              </Stack>
            </DialogContent>
          </>
        ) : (
          <DialogContent sx={{ p: 0 }}>
            <CreateBookingSessionForm
              key={selectedClassId ?? "no-class"}
              initialClassId={selectedClassId}
              onCreateSession={handleCreateSession}
            />
          </DialogContent>
        )}
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
        <TeacherSessionsOverview
          sessions={sessions}
          isLoading={isLoading}
          loadFailed={loadFailed}
          onRetry={() => {
            setIsLoading(true);
            setLoadFailed(false);
            void fetchSessions();
          }}
          onCreate={openCreateDialog}
          onEdit={handleEditSession}
          onView={handleViewBookings}
          onDelete={handleDeleteSessionClick}
        />
      </Container>
    </>
  );
}
