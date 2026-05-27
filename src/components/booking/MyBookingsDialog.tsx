"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { StudentBookingLookup } from "@/types/booking";
import { useTranslations } from "@/i18n/useTranslations";

type MyBookingsDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function MyBookingsDialog({
  open,
  onClose,
}: MyBookingsDialogProps) {
  const [studentEmail, setStudentEmail] = useState("");
  const [bookings, setBookings] = useState<StudentBookingLookup[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { t } = useTranslations();

  const handleClose = () => {
    setStudentEmail("");
    setBookings([]);
    setHasSearched(false);
    setErrorMessage("");
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t.myBookingsDialog.title}</DialogTitle>

      <DialogContent>
        <Stack
          spacing={3}
          component="form"
          onSubmit={handleSearch}
          sx={{ mt: 1 }}
        >
          <Typography color="text.secondary">
            {t.myBookingsDialog.description}
          </Typography>

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <TextField
            label={t.myBookingsDialog.emailLabel}
            type="email"
            fullWidth
            value={studentEmail}
            onChange={(event) => setStudentEmail(event.target.value)}
          />

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={handleClose} disabled={isSearching}>
              {t.myBookingsDialog.closeButton}
            </Button>

            <Button variant="contained" type="submit" disabled={isSearching}>
              {isSearching
                ? t.myBookingsDialog.searchingButton
                : t.myBookingsDialog.searchButton}
            </Button>
          </DialogActions>

          {hasSearched && bookings.length === 0 && (
            <Typography color="text.secondary">
              {t.myBookingsDialog.empty}
            </Typography>
          )}

          {bookings.length > 0 && (
            <Stack spacing={2}>
              {bookings.map((booking) => (
                <Paper key={booking.id} sx={{ p: 2, borderRadius: 2 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {booking.sessionTitle}
                    </Typography>

                    <Typography color="text.secondary">
                      {t.myBookingsDialog.date}: {booking.sessionDate}
                    </Typography>

                    <Typography color="text.secondary">
                      {t.myBookingsDialog.assignedTime}: {booking.slotStartTime}
                      –{booking.slotEndTime}
                    </Typography>
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
