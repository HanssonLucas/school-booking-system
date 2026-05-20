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

  const handleChange = (field: keyof FormValues, value: string) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
        />

        <TextField
          label="Beskrivning"
          fullWidth
          multiline
          minRows={3}
          value={formValues.description}
          onChange={(event) => handleChange("description", event.target.value)}
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
