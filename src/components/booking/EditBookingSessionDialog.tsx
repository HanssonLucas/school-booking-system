"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import type { BookingSession } from "@/types/booking";
import { useTranslations } from "@/i18n/useTranslations";

type EditFormValues = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  maxParticipants: string;
};

type EditBookingSessionDialogProps = {
  open: boolean;
  session: BookingSession | null;
  onClose: () => void;
  onSave: (sessionId: number, values: EditFormValues) => void;
};

const initialFormValues: EditFormValues = {
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  maxParticipants: "",
};

export default function EditBookingSessionDialog({
  open,
  session,
  onClose,
  onSave,
}: EditBookingSessionDialogProps) {
  const [formValues, setFormValues] =
    useState<EditFormValues>(initialFormValues);

  const { t } = useTranslations();

  useEffect(() => {
    if (!session) {
      setFormValues(initialFormValues);
      return;
    }

    setFormValues({
      title: session.title,
      description: session.description,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      maxParticipants: String(session.maxParticipants),
    });
  }, [session]);

  const handleChange = (field: keyof EditFormValues, value: string) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session) {
      return;
    }

    onSave(session.id, formValues);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t.editSessionDialog.title}</DialogTitle>

      <DialogContent>
        <Stack
          spacing={3}
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 1 }}
        >
          <TextField
            label={t.editSessionDialog.titleLabel}
            fullWidth
            value={formValues.title}
            onChange={(event) => handleChange("title", event.target.value)}
          />

          <TextField
            label={t.editSessionDialog.descriptionLabel}
            fullWidth
            multiline
            minRows={3}
            value={formValues.description}
            onChange={(event) =>
              handleChange("description", event.target.value)
            }
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label={t.editSessionDialog.dateLabel}
              type="date"
              fullWidth
              value={formValues.date}
              onChange={(event) => handleChange("date", event.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            <TextField
              label={t.editSessionDialog.startTimeLabel}
              type="time"
              fullWidth
              value={formValues.startTime}
              onChange={(event) =>
                handleChange("startTime", event.target.value)
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            <TextField
              label={t.editSessionDialog.endTimeLabel}
              type="time"
              fullWidth
              value={formValues.endTime}
              onChange={(event) => handleChange("endTime", event.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Stack>

          <TextField
            label={t.editSessionDialog.maxParticipantsLabel}
            type="number"
            fullWidth
            value={formValues.maxParticipants}
            onChange={(event) =>
              handleChange("maxParticipants", event.target.value)
            }
          />

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={onClose}>
              {t.editSessionDialog.cancelButton}
            </Button>

            <Button variant="contained" type="submit">
              {t.editSessionDialog.saveButton}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
