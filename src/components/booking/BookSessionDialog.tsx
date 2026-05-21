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

type BookSessionDialogProps = {
  open: boolean;
  sessionTitle?: string;
  onClose: () => void;
  onSubmit: (studentName: string, studentEmail: string) => Promise<boolean>;
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!studentName.trim() || !studentEmail.trim()) {
      setErrorMessage("Namn och email krävs");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const wasBooked = await onSubmit(studentName, studentEmail);

    setIsSubmitting(false);

    if (!wasBooked) {
      setErrorMessage(
        "Det gick inte att boka platsen. Tillfället kan vara fullbokat.",
      );
      return;
    }

    setStudentName("");
    setStudentEmail("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Boka plats</DialogTitle>

      <DialogContent>
        <Stack
          spacing={3}
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 1 }}
        >
          {sessionTitle && (
            <Typography color="text.secondary">
              Du bokar en plats på: <strong>{sessionTitle}</strong>
            </Typography>
          )}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <TextField
            label="Namn"
            fullWidth
            value={studentName}
            onChange={(event) => setStudentName(event.target.value)}
          />

          <TextField
            label="Email"
            type="email"
            fullWidth
            value={studentEmail}
            onChange={(event) => setStudentEmail(event.target.value)}
          />

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={onClose} disabled={isSubmitting}>
              Avbryt
            </Button>

            <Button variant="contained" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Bokar..." : "Boka plats"}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
