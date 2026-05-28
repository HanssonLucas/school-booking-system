"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import TitleOutlinedIcon from "@mui/icons-material/TitleOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import type { CreateBookingSessionInput } from "@/types/booking";
import { useTranslations } from "@/i18n/useTranslations";
import { getSlotCount } from "@/lib/bookingSlots";

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

  const calculatedSlotCount =
    formValues.startTime && formValues.endTime
      ? getSlotCount(formValues.startTime, formValues.endTime)
      : 0;

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

    if (
      formValues.startTime &&
      formValues.endTime &&
      calculatedSlotCount <= 0
    ) {
      errors.endTime = t.errors.invalidSessionTimeRange;
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
      maxParticipants: calculatedSlotCount,
    });

    setFormValues(initialFormValues);
  };

  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
    },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        overflow: "hidden",
        borderRadius: 5,
        border: 1,
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          p: { xs: 3, sm: 4 },
          pb: 2,
          background:
            "linear-gradient(135deg, rgba(156, 39, 176, 0.14), rgba(25, 118, 210, 0.08))",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 4,
              display: "grid",
              placeItems: "center",
              bgcolor: "secondary.main",
              color: "secondary.contrastText",
              boxShadow: 3,
              flexShrink: 0,
            }}
          >
            <AddRoundedIcon />
          </Box>

          <Box>
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 900, letterSpacing: -0.4 }}
            >
              {t.createSessionForm.title}
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {t.bookingSession.slotDuration}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: { xs: 3, sm: 4 } }}
      >
        <Stack spacing={3}>
          <TextField
            label={t.createSessionForm.titleLabel}
            fullWidth
            value={formValues.title}
            onChange={(event) => handleChange("title", event.target.value)}
            error={Boolean(formErrors.title)}
            helperText={formErrors.title}
            slotProps={{
              input: {
                startAdornment: (
                  <TitleOutlinedIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              },
            }}
            sx={textFieldSx}
          />

          <TextField
            label={t.createSessionForm.descriptionLabel}
            fullWidth
            multiline
            minRows={3}
            value={formValues.description}
            onChange={(event) =>
              handleChange("description", event.target.value)
            }
            error={Boolean(formErrors.description)}
            helperText={formErrors.description}
            slotProps={{
              input: {
                startAdornment: (
                  <NotesOutlinedIcon
                    sx={{
                      mr: 1,
                      mt: 1,
                      color: "text.secondary",
                      alignSelf: "flex-start",
                    }}
                  />
                ),
              },
            }}
            sx={textFieldSx}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              alignItems: "flex-start",
            }}
          >
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
                input: {
                  startAdornment: (
                    <CalendarMonthOutlinedIcon
                      sx={{ mr: 1, color: "text.secondary" }}
                    />
                  ),
                },
              }}
              error={Boolean(formErrors.date)}
              helperText={formErrors.date}
              sx={textFieldSx}
            />

            <TextField
              label={t.createSessionForm.startTimeLabel}
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
                input: {
                  startAdornment: (
                    <AccessTimeOutlinedIcon
                      sx={{ mr: 1, color: "text.secondary" }}
                    />
                  ),
                },
              }}
              error={Boolean(formErrors.startTime)}
              helperText={formErrors.startTime}
              sx={textFieldSx}
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
                input: {
                  startAdornment: (
                    <AccessTimeOutlinedIcon
                      sx={{ mr: 1, color: "text.secondary" }}
                    />
                  ),
                },
              }}
              error={Boolean(formErrors.endTime)}
              helperText={formErrors.endTime}
              sx={textFieldSx}
            />
          </Stack>

          <Alert
            severity={calculatedSlotCount > 0 ? "info" : "warning"}
            icon={<TimerOutlinedIcon />}
            sx={{ borderRadius: 3 }}
          >
            {t.createSessionForm.calculatedSlotsLabel}{" "}
            <Box component="span" sx={{ fontWeight: 900 }}>
              {calculatedSlotCount > 0 ? calculatedSlotCount : "-"}
            </Box>
          </Alert>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              type="submit"
              startIcon={<AddRoundedIcon />}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                px: 3,
                py: 1.1,
              }}
            >
              {t.createSessionForm.submitButton}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
