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
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import { useRouter } from "next/navigation";
import type { BookingSession, BookingWithSlotTime } from "@/types/booking";
import { useAuth } from "@/components/auth/useAuth";
import { useTranslations } from "@/i18n/useTranslations";
import BookingDialogHeader from "@/components/booking/BookingDialogHeader";

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
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

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

    const controller = new AbortController();

    const fetchBookings = async () => {
      setIsLoading(true);
      setLoadFailed(false);

      try {
        const response = await fetch(`/api/bookings?sessionId=${session.id}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Could not load bookings");
        }

        const data: BookingWithSlotTime[] = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid bookings response");
        }

        if (!controller.signal.aborted) {
          setBookings(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setBookings([]);
          setLoadFailed(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchBookings();

    return () => controller.abort();
  }, [open, session, currentUser?.emailVerified, loadAttempt]);

  const handleClose = () => {
    setBookings([]);
    setLoadFailed(false);
    setIsLoading(true);
    onClose();
  };

  const handleRetry = () => {
    setLoadFailed(false);
    setIsLoading(true);
    setLoadAttempt((attempt) => attempt + 1);
  };

  const isEmailUnverified = currentUser?.emailVerified === false;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="view-bookings-heading"
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
      <BookingDialogHeader
        id="view-bookings-heading"
        eyebrow={t.bookingsDialog.title}
        title={session?.title ?? t.bookingsDialog.title}
        description={
          session
            ? `${formatDatePart({
                day: "numeric",
                month: "long",
                year: "numeric",
              })} · ${session.startTime.slice(0, 5)}–${session.endTime.slice(0, 5)}`
            : undefined
        }
        onClose={handleClose}
      />

      <DialogContent sx={{ px: { xs: 2.5, sm: 4 }, py: 2.5 }}>
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
        ) : loadFailed ? (
          <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
            <Alert severity="error" sx={{ borderRadius: 3, width: "100%" }}>
              {t.bookingsDialog.loadFailed}
            </Alert>

            <Button
              variant="outlined"
              onClick={handleRetry}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                minHeight: 44,
                px: 2.5,
              }}
            >
              {t.bookingsDialog.retry}
            </Button>
          </Stack>
        ) : bookings.length === 0 ? (
          <Stack
            spacing={1}
            sx={{
              alignItems: "center",
              textAlign: "center",
              px: 1,
              py: 3,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                display: "grid",
                placeItems: "center",
                borderRadius: 3,
                color: "primary.main",
                position: "relative",
                isolation: "isolate",
                mb: 1,
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
              <EventOutlinedIcon sx={{ fontSize: 28 }} />
            </Box>

            <Typography
              component="h3"
              sx={{
                fontSize: "1.1rem",
                fontWeight: 800,
                letterSpacing: -0.2,
              }}
            >
              {t.bookingsDialog.emptyTitle}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 360, lineHeight: 1.6 }}
            >
              {t.bookingsDialog.emptyDescription}
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", py: 1 }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 3,
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
                <GroupsOutlinedIcon sx={{ fontSize: 26 }} />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  component="h3"
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    letterSpacing: -0.2,
                  }}
                >
                  {t.bookingsDialog.participantsTitle}
                </Typography>

                {session && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, lineHeight: 1.6 }}
                  >
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
              </Box>
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
            px: { xs: 2.5, sm: 4 },
            pb: 3,
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
