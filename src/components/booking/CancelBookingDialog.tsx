"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type CancelBookingDialogProps = {
  open: boolean;
  sessionTitle?: string;
  onClose: () => void;
  onSubmit: (
    studentEmail: string,
  ) => Promise<{ success: boolean; message?: string }>;
};

export default function CancelBookingDialog({
  open,
  sessionTitle,
  onClose,
  onSubmit,
}: CancelBookingDialogProps) {
  const [studentEmail, setStudentEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setStudentEmail("");
    setErrorMessage("");
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!studentEmail.trim()) {
      setErrorMessage("Email krävs");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const result = await onSubmit(studentEmail);

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(
        result.message ?? "Det gick inte att avboka platsen. Försök igen.",
      );
      return;
    }

    setStudentEmail("");
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Avboka plats</DialogTitle>

      <DialogContent>
        <Stack
          spacing={3}
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 1 }}
        >
          {sessionTitle && (
            <Typography color="text.secondary">
              Du avbokar en plats från: <strong>{sessionTitle}</strong>
            </Typography>
          )}

          <Typography color="text.secondary">
            Skriv in den email som användes vid bokningen.
          </Typography>

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <TextField
            label="Email"
            type="email"
            fullWidth
            value={studentEmail}
            onChange={(event) => setStudentEmail(event.target.value)}
          />

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={handleClose} disabled={isSubmitting}>
              Avbryt
            </Button>

            <Button
              variant="contained"
              color="error"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Avbokar..." : "Avboka plats"}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
