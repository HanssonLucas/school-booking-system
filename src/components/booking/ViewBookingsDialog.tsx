"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {t.bookingsDialog.title}
        {session ? ` - ${session.title}` : ""}
      </DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Typography color="text.secondary">
            {t.bookingsDialog.loading}
          </Typography>
        ) : bookings.length === 0 ? (
          <Typography color="text.secondary">
            {t.bookingsDialog.empty}
          </Typography>
        ) : (
          <Stack spacing={2}>
            {bookings.map((booking) => (
              <Paper key={booking.id} sx={{ p: 2, borderRadius: 2 }}>
                <Stack spacing={0.5}>
                  <Typography>
                    <strong>{t.bookingsDialog.name}:</strong>{" "}
                    {booking.studentName}
                  </Typography>

                  <Typography>
                    <strong>{t.bookingsDialog.email}:</strong>{" "}
                    {booking.studentEmail}
                  </Typography>

                  <Typography>
                    <strong>{t.bookingsDialog.assignedTime}:</strong>{" "}
                    {booking.slotStartTime}–{booking.slotEndTime}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>{t.bookingsDialog.closeButton}</Button>
      </DialogActions>
    </Dialog>
  );
}
