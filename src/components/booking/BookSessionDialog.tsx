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

type BookSessionDialogProps = {
  open: boolean;
  sessionTitle?: string;
  onClose: () => void;
  onSubmit: (
    studentName: string,
    studentEmail: string,
  ) => Promise<{ success: boolean; message?: string }>;
};

export default function BookSessionDialog({
  open,
  sessionTitle,
  onClose,
  onSubmit,
}: BookSessionDialogProps) {
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { t } = useTranslations();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!studentName.trim() || !studentEmail.trim()) {
      setErrorMessage(t.bookSessionDialog.requiredError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const result = await onSubmit(studentName, studentEmail);

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message ?? t.bookSessionDialog.fallbackError);
      return;
    }

    setStudentName("");
    setStudentEmail("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t.bookSessionDialog.title}</DialogTitle>

      <DialogContent>
        <Stack
          spacing={3}
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 1 }}
        >
          {sessionTitle && (
            <Typography color="text.secondary">
              {t.bookSessionDialog.bookingFor} <strong>{sessionTitle}</strong>
            </Typography>
          )}

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <TextField
            label={t.bookSessionDialog.nameLabel}
            fullWidth
            value={studentName}
            onChange={(event) => setStudentName(event.target.value)}
          />

          <TextField
            label={t.bookSessionDialog.emailLabel}
            type="email"
            fullWidth
            value={studentEmail}
            onChange={(event) => setStudentEmail(event.target.value)}
          />

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={onClose} disabled={isSubmitting}>
              {t.bookSessionDialog.cancelButton}
            </Button>

            <Button variant="contained" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t.bookSessionDialog.submittingButton
                : t.bookSessionDialog.submitButton}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
