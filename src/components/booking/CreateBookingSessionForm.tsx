"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { CreateBookingSessionInput } from "@/types/booking";
import { useTranslations } from "@/i18n/useTranslations";

type FormValues = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  maxParticipants: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

type CreateBookingSessionFormProps = {
  onCreateSession: (session: CreateBookingSessionInput) => void;
};

const initialFormValues: FormValues = {
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  maxParticipants: "",
};

export default function CreateBookingSessionForm({
  onCreateSession,
}: CreateBookingSessionFormProps) {
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const { t } = useTranslations();

  const handleChange = (field: keyof FormValues, value: string) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  };

  const validateForm = () => {
    const errors: FormErrors = {};

    if (!formValues.title.trim()) {
      errors.title = t.createSessionForm.titleRequired;
    }

    if (!formValues.date) {
      errors.date = t.createSessionForm.dateRequired;
    }

    if (!formValues.startTime) {
      errors.startTime = t.createSessionForm.startTimeRequired;
    }

    if (!formValues.endTime) {
      errors.endTime = t.createSessionForm.endTimeRequired;
    }

    if (!formValues.maxParticipants) {
      errors.maxParticipants = t.createSessionForm.maxParticipantsRequired;
    }

    if (formValues.maxParticipants && Number(formValues.maxParticipants) <= 0) {
      errors.maxParticipants = t.createSessionForm.maxParticipantsMin;
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    onCreateSession({
      title: formValues.title,
      description: formValues.description,
      date: formValues.date,
      startTime: formValues.startTime,
      endTime: formValues.endTime,
      maxParticipants: Number(formValues.maxParticipants),
    });

    setFormValues(initialFormValues);
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {t.createSessionForm.title}
      </Typography>

      <Stack spacing={3} component="form" onSubmit={handleSubmit}>
        <TextField
          label={t.createSessionForm.titleLabel}
          fullWidth
          value={formValues.title}
          onChange={(event) => handleChange("title", event.target.value)}
          error={Boolean(formErrors.title)}
          helperText={formErrors.title}
        />

        <TextField
          label={t.createSessionForm.descriptionLabel}
          fullWidth
          multiline
          minRows={3}
          value={formValues.description}
          onChange={(event) => handleChange("description", event.target.value)}
          error={Boolean(formErrors.description)}
          helperText={formErrors.description}
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label={t.createSessionForm.dateLabel}
            type="date"
            fullWidth
            value={formValues.date}
            onChange={(event) => handleChange("date", event.target.value)}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            error={Boolean(formErrors.date)}
            helperText={formErrors.date}
          />

          <TextField
            label={t.createSessionForm.startTimeLabel}
            type="time"
            fullWidth
            value={formValues.startTime}
            onChange={(event) => handleChange("startTime", event.target.value)}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            error={Boolean(formErrors.startTime)}
            helperText={formErrors.startTime}
          />

          <TextField
            label={t.createSessionForm.endTimeLabel}
            type="time"
            fullWidth
            value={formValues.endTime}
            onChange={(event) => handleChange("endTime", event.target.value)}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            error={Boolean(formErrors.endTime)}
            helperText={formErrors.endTime}
          />
        </Stack>

        <TextField
          label={t.createSessionForm.maxParticipantsLabel}
          type="number"
          fullWidth
          value={formValues.maxParticipants}
          onChange={(event) =>
            handleChange("maxParticipants", event.target.value)
          }
          error={Boolean(formErrors.maxParticipants)}
          helperText={formErrors.maxParticipants}
        />

        <Box>
          <Button variant="contained" type="submit">
            {t.createSessionForm.submitButton}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
