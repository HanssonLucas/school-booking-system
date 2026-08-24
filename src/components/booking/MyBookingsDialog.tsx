"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import type { StudentBookingLookup } from "@/types/booking";
import type { AuthUser } from "@/types/auth";
import { useTranslations } from "@/i18n/useTranslations";
import {
  createCalendarFileName,
  createGoogleCalendarUrl,
  createIcsFileContent,
  createOutlookCalendarUrl,
  downloadIcsFile,
  openCalendarUrl,
} from "@/lib/calendar";

type MyBookingsDialogProps = {
  open: boolean;
  currentUser: AuthUser | null;
  isAuthLoading: boolean;
  onClose: () => void;
  onBookingCancelled?: (sessionId: number) => void;
};

export default function MyBookingsDialog({
  open,
  currentUser,
  isAuthLoading,
  onClose,
  onBookingCancelled,
}: MyBookingsDialogProps) {
  const [bookings, setBookings] = useState<StudentBookingLookup[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(
    null,
  );
  const [calendarMenuAnchor, setCalendarMenuAnchor] =
    useState<HTMLElement | null>(null);
  const [selectedCalendarBooking, setSelectedCalendarBooking] =
    useState<StudentBookingLookup | null>(null);

  const router = useRouter();
  const { t } = useTranslations();

  const isStudent = currentUser?.role === "student";

  const fetchMyBookings = useCallback(async () => {
    if (isAuthLoading) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setHasLoaded(false);

    if (!currentUser || currentUser.role !== "student") {
      setBookings([]);
      setHasLoaded(true);
      return;
    }

    if (!currentUser.emailVerified) {
      setBookings([]);
      setHasLoaded(true);
      return;
    }

    setIsLoadingBookings(true);

    try {
      const response = await fetch("/api/bookings/me");

      if (!response.ok) {
        const errorData = (await response.json()) as { code?: string };

        const errorMessages: Record<string, string> = {
          UNAUTHORIZED: t.auth.studentLoginRequired,
          FORBIDDEN: t.auth.studentActionForbidden,
        };

        setErrorMessage(
          errorMessages[errorData.code ?? ""] ?? t.errors.unknown,
        );
        setBookings([]);
        return;
      }

      const data = (await response.json()) as StudentBookingLookup[];

      setBookings(data);
      setHasLoaded(true);
    } finally {
      setIsLoadingBookings(false);
    }
  }, [
    currentUser,
    isAuthLoading,
    t.auth.studentActionForbidden,
    t.auth.studentLoginRequired,
    t.errors.unknown,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    queueMicrotask(() => {
      void fetchMyBookings();
    });
  }, [open, fetchMyBookings]);

  const handleClose = () => {
    setBookings([]);
    setHasLoaded(false);
    setErrorMessage("");
    setSuccessMessage("");
    setCancellingBookingId(null);
    setCalendarMenuAnchor(null);
    setSelectedCalendarBooking(null);
    onClose();
  };

  const handleCancelBooking = async (booking: StudentBookingLookup) => {
    setCancellingBookingId(booking.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/bookings", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: booking.sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { code?: string };

        const errorMessages: Record<string, string> = {
          UNAUTHORIZED: t.auth.studentLoginRequired,
          FORBIDDEN: t.auth.studentActionForbidden,
          MISSING_CANCELLATION_FIELDS: t.errors.missingCancellationFields,
          BOOKING_NOT_FOUND: t.errors.bookingNotFound,
        };

        setErrorMessage(
          errorMessages[errorData.code ?? ""] ?? t.errors.unknown,
        );

        return;
      }

      setBookings((currentBookings) =>
        currentBookings.filter(
          (currentBooking) => currentBooking.id !== booking.id,
        ),
      );

      onBookingCancelled?.(booking.sessionId);
      setSuccessMessage(t.student.cancellationSuccess);
    } finally {
      setCancellingBookingId(null);
    }
  };

  const createCalendarEventDescription = (booking: StudentBookingLookup) => {
    return `${t.bookingsDialog.assignedTime}: ${booking.slotStartTime}–${booking.slotEndTime}`;
  };

  const handleOpenCalendarMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    booking: StudentBookingLookup,
  ) => {
    setCalendarMenuAnchor(event.currentTarget);
    setSelectedCalendarBooking(booking);
  };

  const handleCloseCalendarMenu = () => {
    setCalendarMenuAnchor(null);
    setSelectedCalendarBooking(null);
  };

  const handleOpenGoogleCalendar = () => {
    if (!selectedCalendarBooking) {
      return;
    }

    const googleCalendarUrl = createGoogleCalendarUrl({
      title: selectedCalendarBooking.sessionTitle,
      description: createCalendarEventDescription(selectedCalendarBooking),
      date: selectedCalendarBooking.sessionDate,
      startTime: selectedCalendarBooking.slotStartTime,
      endTime: selectedCalendarBooking.slotEndTime,
    });

    openCalendarUrl(googleCalendarUrl);
    handleCloseCalendarMenu();
  };

  const handleOpenOutlookCalendar = () => {
    if (!selectedCalendarBooking) {
      return;
    }

    const outlookCalendarUrl = createOutlookCalendarUrl({
      title: selectedCalendarBooking.sessionTitle,
      description: createCalendarEventDescription(selectedCalendarBooking),
      date: selectedCalendarBooking.sessionDate,
      startTime: selectedCalendarBooking.slotStartTime,
      endTime: selectedCalendarBooking.slotEndTime,
    });

    openCalendarUrl(outlookCalendarUrl);
    handleCloseCalendarMenu();
  };

  const handleDownloadCalendarFile = () => {
    if (!selectedCalendarBooking) {
      return;
    }

    const calendarContent = createIcsFileContent({
      title: selectedCalendarBooking.sessionTitle,
      description: createCalendarEventDescription(selectedCalendarBooking),
      date: selectedCalendarBooking.sessionDate,
      startTime: selectedCalendarBooking.slotStartTime,
      endTime: selectedCalendarBooking.slotEndTime,
    });

    const fileName = createCalendarFileName(
      selectedCalendarBooking.sessionTitle,
      selectedCalendarBooking.sessionDate,
    );

    downloadIcsFile(fileName, calendarContent);
    handleCloseCalendarMenu();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 5,
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
          },
        },
      }}
    >
      <Box
        sx={{
          p: { xs: 3, sm: 4 },
          pb: 2,
          background:
            "linear-gradient(135deg, rgba(25, 118, 210, 0.14), rgba(76, 175, 80, 0.08))",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 4,
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              boxShadow: 3,
              flexShrink: 0,
            }}
          >
            <SearchOutlinedIcon />
          </Box>

          <Box>
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 900, letterSpacing: -0.4 }}
            >
              {t.myBookingsDialog.title}
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {t.myBookingsDialog.description}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Menu
        anchorEl={calendarMenuAnchor}
        open={Boolean(calendarMenuAnchor)}
        onClose={handleCloseCalendarMenu}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              minWidth: 220,
            },
          },
        }}
      >
        <MenuItem onClick={handleOpenGoogleCalendar}>
          {t.myBookingsDialog.googleCalendarOption}
        </MenuItem>

        <MenuItem onClick={handleOpenOutlookCalendar}>
          {t.myBookingsDialog.outlookCalendarOption}
        </MenuItem>

        <MenuItem onClick={handleDownloadCalendarFile}>
          {t.myBookingsDialog.downloadCalendarFileOption}
        </MenuItem>
      </Menu>

      <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={3}>
          {isAuthLoading && (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              {t.auth.loadingUser}
            </Alert>
          )}

          {!isAuthLoading && !currentUser && (
            <Alert severity="warning" sx={{ borderRadius: 3 }}>
              {t.auth.studentLoginRequired}
            </Alert>
          )}

          {!isAuthLoading && currentUser && !isStudent && (
            <Alert severity="warning" sx={{ borderRadius: 3 }}>
              {t.auth.studentActionForbidden}
            </Alert>
          )}

          {!isAuthLoading && currentUser && isStudent && (
            <Alert
              severity="info"
              icon={<PersonOutlineOutlinedIcon />}
              sx={{ borderRadius: 3 }}
            >
              {t.auth.loggedInAs}{" "}
              <Box component="span" sx={{ fontWeight: 900 }}>
                {currentUser.name}
              </Box>{" "}
              ({currentUser.email})
            </Alert>
          )}

          {!isAuthLoading &&
            currentUser &&
            isStudent &&
            !currentUser.emailVerified && (
              <Alert severity="warning" sx={{ borderRadius: 3 }}>
                {t.auth.emailVerificationRequired}
              </Alert>
            )}

          {isLoadingBookings && (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              {t.bookingsDialog.loading}
            </Alert>
          )}

          {errorMessage && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {errorMessage}
            </Alert>
          )}

          {successMessage && (
            <Alert
              severity="success"
              sx={{
                borderRadius: 3,
                py: 0.5,
                "& .MuiAlert-message": {
                  py: 0.5,
                },
              }}
            >
              {successMessage}
            </Alert>
          )}

          {hasLoaded &&
            !isLoadingBookings &&
            currentUser?.role === "student" &&
            currentUser.emailVerified &&
            bookings.length === 0 && (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                {t.myBookingsDialog.empty}
              </Alert>
            )}

          {bookings.length > 0 && (
            <Stack spacing={1.5}>
              {bookings.map((booking) => (
                <Paper
                  key={booking.id}
                  elevation={0}
                  sx={{
                    p: 2.25,
                    borderRadius: 4,
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "background.default",
                  }}
                >
                  <Stack spacing={1.75}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 900, letterSpacing: -0.2 }}
                        >
                          {booking.sessionTitle}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.25 }}
                        >
                          {t.myBookingsDialog.date}: {booking.sessionDate}
                        </Typography>
                      </Box>

                      <Chip
                        icon={<EventAvailableOutlinedIcon />}
                        label={`${booking.slotStartTime}–${booking.slotEndTime}`}
                        color="success"
                        sx={{
                          borderRadius: 999,
                          fontWeight: 800,
                        }}
                      />
                    </Stack>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Chip
                        icon={<CalendarMonthOutlinedIcon />}
                        label={booking.sessionDate}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: 999,
                          bgcolor: "action.hover",
                        }}
                      />

                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap" }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<FileDownloadOutlinedIcon />}
                          endIcon={<ArrowDropDownRoundedIcon />}
                          onClick={(event) =>
                            handleOpenCalendarMenu(event, booking)
                          }
                          sx={{
                            borderRadius: 999,
                            textTransform: "none",
                            fontWeight: 800,
                            px: 1.5,
                          }}
                        >
                          {t.myBookingsDialog.addToCalendarButton}
                        </Button>

                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          startIcon={<EventBusyOutlinedIcon />}
                          disabled={cancellingBookingId === booking.id}
                          onClick={() => handleCancelBooking(booking)}
                          sx={{
                            borderRadius: 999,
                            textTransform: "none",
                            fontWeight: 800,
                            px: 1.5,
                          }}
                        >
                          {cancellingBookingId === booking.id
                            ? t.cancelBookingDialog.submittingButton
                            : t.bookingSession.cancelButton}
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
          <DialogActions
            sx={{
              px: 0,
              pt: 1,
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Button
              onClick={handleClose}
              disabled={isLoadingBookings || cancellingBookingId !== null}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                px: 2.5,
              }}
            >
              {t.myBookingsDialog.closeButton}
            </Button>

            {!currentUser && !isAuthLoading && (
              <Button
                variant="contained"
                startIcon={<LoginOutlinedIcon />}
                onClick={() => router.push("/login")}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                  px: 2.5,
                }}
              >
                {t.auth.loginButton}
              </Button>
            )}

            {currentUser && isStudent && !currentUser.emailVerified ? (
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
            ) : (
              currentUser &&
              isStudent && (
                <Button
                  variant="contained"
                  startIcon={<RefreshOutlinedIcon />}
                  disabled={isLoadingBookings || cancellingBookingId !== null}
                  onClick={() => {
                    void fetchMyBookings();
                  }}
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 800,
                    px: 2.5,
                  }}
                >
                  {t.myBookingsDialog.refreshButton}
                </Button>
              )
            )}
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
