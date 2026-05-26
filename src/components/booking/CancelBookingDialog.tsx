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
import { useTranslations } from "@/i18n/useTranslations";

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

  const { t } = useTranslations();

  const handleClose = () => {
    setStudentEmail("");
    setErrorMessage("");
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!studentEmail.trim()) {
      setErrorMessage(t.cancelBookingDialog.requiredError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const result = await onSubmit(studentEmail);

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message ?? t.cancelBookingDialog.fallbackError);
      return;
    }

    setStudentEmail("");
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t.cancelBookingDialog.title}</DialogTitle>

      <DialogContent>
        <Stack
          spacing={3}
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 1 }}
        >
          {sessionTitle && (
            <Typography color="text.secondary">
              {t.cancelBookingDialog.cancellingFor}{" "}
              <strong>{sessionTitle}</strong>
            </Typography>
          )}

          <Typography color="text.secondary">
            {t.cancelBookingDialog.description}
          </Typography>

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <TextField
            label={t.cancelBookingDialog.emailLabel}
            type="email"
            fullWidth
            value={studentEmail}
            onChange={(event) => setStudentEmail(event.target.value)}
          />

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={handleClose} disabled={isSubmitting}>
              {t.cancelBookingDialog.cancelButton}
            </Button>

            <Button
              variant="contained"
              color="error"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t.cancelBookingDialog.submittingButton
                : t.cancelBookingDialog.submitButton}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
