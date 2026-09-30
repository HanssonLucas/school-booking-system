"use client";

import { useEffect, useState } from "react";
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
  Typography,
} from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useRouter } from "next/navigation";
import type { BookingSession, BookingWithSlotTime } from "@/types/booking";
import { useAuth } from "@/components/auth/useAuth";
import { useTranslations } from "@/i18n/useTranslations";

type ViewBookingsDialogProps = {
  open: boolean;
  session: BookingSession | null;
  onClose: () => void;
};

export default function ViewBookingsDialog({
  open,
  session,
  onClose,
}: ViewBookingsDialogProps) {
  const [bookings, setBookings] = useState<BookingWithSlotTime[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { t, language } = useTranslations();

  const sessionDate = session ? new Date(`${session.date}T12:00:00Z`) : null;

  const formatDatePart = (options: Intl.DateTimeFormatOptions) =>
    sessionDate
      ? new Intl.DateTimeFormat(language === "sv" ? "sv-SE" : "en-GB", {
          ...options,
          timeZone: "UTC",
        }).format(sessionDate)
      : "";

  useEffect(() => {
    if (!open || !session || !currentUser?.emailVerified) {
      return;
    }

    const fetchBookings = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/bookings?sessionId=${session.id}`);

        if (!response.ok) {
          console.error("Kunde inte hämta bokningar");
          return;
        }

        const data: BookingWithSlotTime[] = await response.json();
        setBookings(data);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchBookings();
  }, [open, session, currentUser?.emailVerified]);

  const handleClose = () => {
    setBookings([]);
    onClose();
  };

  const isEmailUnverified = currentUser?.emailVerified === false;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={isEmailUnverified ? "sm" : "md"}
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
          },
        },
      }}
    >
      <Box
        sx={{
          p: { xs: 3, sm: 4 },
          position: "relative",
          isolation: "isolate",
          borderBottom: 1,
          borderColor: "divider",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            zIndex: -1,
            bgcolor: "primary.main",
            opacity: 0.06,
            pointerEvents: "none",
          },
        }}
      >
        <Stack
          direction="row"
          spacing={{ xs: 2, sm: 2.5 }}
          sx={{ alignItems: "center" }}
        >
          {session && (
            <Box
              sx={{
                width: { xs: 64, sm: 80 },
                flexShrink: 0,
                py: 1.5,
                borderRadius: 3,
                textAlign: "center",
                color: "primary.main",
                position: "relative",
                isolation: "isolate",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  zIndex: -1,
                  borderRadius: "inherit",
                  bgcolor: "primary.main",
                  opacity: 0.1,
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                {formatDatePart({ month: "short" })}
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: "1.8rem", sm: "2.2rem" },
                  fontWeight: 900,
                  lineHeight: 1.15,
                  my: 0.25,
                }}
              >
                {formatDatePart({ day: "numeric" })}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {formatDatePart({ year: "numeric" })}
              </Typography>
            </Box>
          )}

          <Box sx={{ minWidth: 0 }}>
            {session && (
              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  mb: 0.75,
                }}
              >
                {t.bookingsDialog.title}
              </Typography>
            )}

            <Typography
              component="h2"
              sx={{
                fontSize: { xs: "1.4rem", sm: "1.75rem" },
                fontWeight: 900,
                letterSpacing: -0.4,
                lineHeight: 1.25,
                overflowWrap: "anywhere",
              }}
            >
              {session?.title ?? t.bookingsDialog.title}
            </Typography>

            {session && (
              <Stack
                direction="row"
                spacing={0.75}
                sx={{
                  alignItems: "center",
                  color: "text.secondary",
                  mt: 1,
                }}
              >
                <AccessTimeOutlinedIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">
                  {session.startTime.slice(0, 5)}–{session.endTime.slice(0, 5)}
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      </Box>

      <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
        {isEmailUnverified ? (
          <Stack spacing={3}>
            <Alert severity="warning" sx={{ borderRadius: 3 }}>
              {t.auth.teacherEmailVerificationRequired}
            </Alert>

            <DialogActions
              sx={{
                px: 0,
                pt: 1,
                gap: 1,
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <Button
                onClick={handleClose}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                  px: 2.5,
                }}
              >
                {t.bookingsDialog.closeButton}
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
            </DialogActions>
          </Stack>
        ) : isLoading ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            {t.bookingsDialog.loading}
          </Alert>
        ) : bookings.length === 0 ? (
          <Alert
            severity="info"
            icon={<InfoOutlinedIcon />}
            sx={{ borderRadius: 3 }}
          >
            {t.bookingsDialog.empty}
          </Alert>
        ) : (
          <Stack spacing={2}>
            {bookings.map((booking) => (
              <Paper
                key={booking.id}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: "background.default",
                }}
              >
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    sx={{
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", sm: "center" },
                    }}
                  >
                    <Stack spacing={0.5}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 900, letterSpacing: -0.2 }}
                      >
                        {booking.studentName}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          alignItems: "center",
                          color: "text.secondary",
                        }}
                      >
                        <EmailOutlinedIcon sx={{ fontSize: 18 }} />
                        <Typography variant="body2">
                          {booking.studentEmail}
                        </Typography>
                      </Stack>
                    </Stack>

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

                  <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    sx={{
                      flexWrap: "wrap",
                    }}
                  >
                    <Chip
                      icon={<PersonOutlineOutlinedIcon />}
                      label={`${t.bookingsDialog.name}: ${booking.studentName}`}
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: 999,
                        bgcolor: "action.hover",
                      }}
                    />

                    <Chip
                      icon={<AccessTimeOutlinedIcon />}
                      label={`${t.bookingsDialog.assignedTime}: ${booking.slotStartTime}–${booking.slotEndTime}`}
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: 999,
                        bgcolor: "action.hover",
                      }}
                    />
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </DialogContent>

      {!isEmailUnverified && (
        <DialogActions
          sx={{
            px: { xs: 3, sm: 4 },
            pb: { xs: 3, sm: 4 },
            pt: 0,
          }}
        >
          <Button
            onClick={handleClose}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 800,
              px: 2.5,
            }}
          >
            {t.bookingsDialog.closeButton}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
