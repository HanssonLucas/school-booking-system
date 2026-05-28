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
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { BookingSession, BookingWithSlotTime } from "@/types/booking";
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

  const { t } = useTranslations();

  useEffect(() => {
    if (!open || !session) {
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

    fetchBookings();
  }, [open, session]);

  const handleClose = () => {
    setBookings([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
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
            "linear-gradient(135deg, rgba(156, 39, 176, 0.14), rgba(25, 118, 210, 0.08))",
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
              bgcolor: "secondary.main",
              color: "secondary.contrastText",
              boxShadow: 3,
              flexShrink: 0,
            }}
          >
            <VisibilityOutlinedIcon />
          </Box>

          <Box>
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 900, letterSpacing: -0.4 }}
            >
              {t.bookingsDialog.title}
            </Typography>

            {session && (
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {session.title}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
        {isLoading ? (
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
    </Dialog>
  );
}
