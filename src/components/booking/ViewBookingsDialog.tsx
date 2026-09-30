"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
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
            maxWidth: isEmailUnverified ? 600 : 720,
          },
        },
      }}
    >
      <Box
        sx={{
          px: { xs: 2.5, sm: 3 },
          py: 2.5,
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
                width: { xs: 64, sm: 72 },
                flexShrink: 0,
                py: 1,
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

      <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, py: 2.5 }}>
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
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={0.5}
              sx={{
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
              }}
            >
              <Typography
                component="h3"
                variant="subtitle2"
                sx={{ fontWeight: 800 }}
              >
                {t.bookingsDialog.participantsTitle}
              </Typography>

              {session && (
                <Typography variant="body2" color="text.secondary">
                  {t.bookingsDialog.bookedSlotsSummary
                    .replace(
                      "{booked}",
                      new Intl.NumberFormat(language).format(bookings.length),
                    )
                    .replace(
                      "{total}",
                      new Intl.NumberFormat(language).format(
                        session.maxParticipants,
                      ),
                    )}
                </Typography>
              )}
            </Stack>
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
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: "center", minWidth: 0 }}
                    >
                      <Avatar
                        aria-hidden="true"
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: "transparent",
                          color: "primary.main",
                          fontSize: "0.9rem",
                          fontWeight: 800,
                          flexShrink: 0,
                          isolation: "isolate",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            inset: 0,
                            zIndex: -1,
                            bgcolor: "primary.main",
                            opacity: 0.12,
                          },
                        }}
                      >
                        {booking.studentName
                          .trim()
                          .split(/\s+/)
                          .filter(Boolean)
                          .filter(
                            (_, index, parts) =>
                              index === 0 || index === parts.length - 1,
                          )
                          .map((part) => Array.from(part)[0])
                          .join("")
                          .toLocaleUpperCase(language)}
                      </Avatar>

                      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 900,
                            letterSpacing: -0.2,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {booking.studentName}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            alignItems: "center",
                            color: "text.secondary",
                            minWidth: 0,
                          }}
                        >
                          <EmailOutlinedIcon
                            sx={{ fontSize: 18, flexShrink: 0 }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ minWidth: 0, overflowWrap: "anywhere" }}
                          >
                            {booking.studentEmail}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{
                        alignItems: "center",
                        color: "primary.main",
                        flexShrink: 0,
                      }}
                    >
                      <AccessTimeOutlinedIcon sx={{ fontSize: 18 }} />

                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          fontVariantNumeric: "tabular-nums",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {booking.slotStartTime.slice(0, 5)}–
                        {booking.slotEndTime.slice(0, 5)}
                      </Typography>
                    </Stack>
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
            px: { xs: 2.5, sm: 3 },
            pb: 2,
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
