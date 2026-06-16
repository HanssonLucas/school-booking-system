"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Paper,
  Stack,
  TextField,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import type { StudentBookingLookup } from "@/types/booking";
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
  onClose: () => void;
  onBookingCancelled?: (sessionId: number) => void;
};

export default function MyBookingsDialog({
  open,
  onClose,
  onBookingCancelled,
}: MyBookingsDialogProps) {
  const [studentEmail, setStudentEmail] = useState("");
  const [bookings, setBookings] = useState<StudentBookingLookup[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(
    null,
  );

  const { t } = useTranslations();

  const handleClose = () => {
    setStudentEmail("");
    setBookings([]);
    setHasSearched(false);
    setErrorMessage("");
    setSuccessMessage("");
    setCancellingBookingId(null);
    setCalendarMenuAnchor(null);
    setSelectedCalendarBooking(null);
    onClose();
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!studentEmail.trim()) {
      setErrorMessage(t.myBookingsDialog.requiredError);
      return;
    }

    setIsSearching(true);
    setErrorMessage("");
    setSuccessMessage("");
    setHasSearched(false);

    try {
      const response = await fetch(
        `/api/bookings?studentEmail=${encodeURIComponent(studentEmail)}`,
      );

      if (!response.ok) {
        setErrorMessage(t.errors.unknown);
        return;
      }

      const data: StudentBookingLookup[] = await response.json();

      setBookings(data);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
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
          studentEmail: booking.studentEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        const errorMessages: Record<string, string> = {
          MISSING_CANCELLATION_FIELDS: t.errors.missingCancellationFields,
          BOOKING_NOT_FOUND: t.errors.bookingNotFound,
        };

        setErrorMessage(errorMessages[errorData.code] ?? t.errors.unknown);

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

  const [calendarMenuAnchor, setCalendarMenuAnchor] =
    useState<HTMLElement | null>(null);
  const [selectedCalendarBooking, setSelectedCalendarBooking] =
    useState<StudentBookingLookup | null>(null);

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
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
          }}
        >
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
        <Stack spacing={3} component="form" onSubmit={handleSearch}>
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

          <TextField
            label={t.myBookingsDialog.emailLabel}
            type="email"
            fullWidth
            value={studentEmail}
            onChange={(event) => setStudentEmail(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <EmailOutlinedIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
            }}
          />

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
              disabled={isSearching || cancellingBookingId !== null}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                px: 2.5,
              }}
            >
              {t.myBookingsDialog.closeButton}
            </Button>

            <Button
              variant="contained"
              type="submit"
              disabled={isSearching || cancellingBookingId !== null}
              startIcon={<SearchOutlinedIcon />}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                px: 2.5,
              }}
            >
              {isSearching
                ? t.myBookingsDialog.searchingButton
                : t.myBookingsDialog.searchButton}
            </Button>
          </DialogActions>

          {hasSearched && bookings.length === 0 && (
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
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
