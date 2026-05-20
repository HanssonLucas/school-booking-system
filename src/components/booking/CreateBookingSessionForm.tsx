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

type FormValues = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  maxParticipants: string;
};

const initialFormValues: FormValues = {
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  maxParticipants: "",
};

export default function CreateBookingSessionForm() {
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  type FormErrors = Partial<Record<keyof FormValues, string>>;

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
      errors.title = "Titel krävs";
    }

    if (!formValues.date) {
      errors.date = "Datum krävs";
    }

    if (!formValues.startTime) {
      errors.startTime = "Starttid krävs";
    }

    if (!formValues.endTime) {
      errors.endTime = "Sluttid krävs";
    }

    if (!formValues.maxParticipants) {
      errors.maxParticipants = "Max antal deltagare krävs";
    }

    if (formValues.maxParticipants && Number(formValues.maxParticipants) <= 0) {
      errors.maxParticipants = "Antalet deltagare måste vara minst 1";
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

    console.log("Formulärdata:", formValues);
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Skapa bokningstillfälle
      </Typography>

      <Stack spacing={3} component="form" onSubmit={handleSubmit}>
        <TextField
          label="Titel"
          fullWidth
          value={formValues.title}
          onChange={(event) => handleChange("title", event.target.value)}
          error={Boolean(formErrors.title)}
          helperText={formErrors.title}
        />

        <TextField
          label="Beskrivning"
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
            label="Datum"
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
            label="Starttid"
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
            label="Sluttid"
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
          label="Max antal deltagare"
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
            Skapa tillfälle
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
