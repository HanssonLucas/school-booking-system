"use client";

import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import TitleOutlinedIcon from "@mui/icons-material/TitleOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import type { CreateBookingSessionInput } from "@/types/booking";
import { useTranslations } from "@/i18n/useTranslations";
import { getSlotCount, SLOT_DURATION_OPTIONS } from "@/lib/bookingSlots";

type FormValues = {
  classId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

type CreateBookingSessionFormProps = {
  onCreateSession: (session: CreateBookingSessionInput) => void | Promise<void>;
};

const initialFormValues: FormValues = {
  classId: "",
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  slotDurationMinutes: "15",
};

type TeacherClass = { id: number; name: string };
type ClassLoadError =
  | "loadFailed"
  | "unauthorized"
  | "forbidden"
  | "verificationRequired";
type ClassLoadState =
  | { status: "loading" }
  | { status: "error"; error: ClassLoadError }
  | { status: "ready"; classes: TeacherClass[] };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isTeacherClass = (value: unknown): value is TeacherClass =>
  isRecord(value) &&
  typeof value.id === "number" &&
  Number.isSafeInteger(value.id) &&
  value.id > 0 &&
  typeof value.name === "string";

const getClassLoadError = (value: unknown): ClassLoadError => {
  switch (isRecord(value) ? value.code : undefined) {
    case "UNAUTHORIZED":
      return "unauthorized";
    case "FORBIDDEN":
      return "forbidden";
    case "EMAIL_NOT_VERIFIED":
      return "verificationRequired";
    default:
      return "loadFailed";
  }
};

export default function CreateBookingSessionForm({
  onCreateSession,
}: CreateBookingSessionFormProps) {
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const { t } = useTranslations();
  const text = t.bookingClassSelect;
  const [classState, setClassState] = useState<ClassLoadState>({
    status: "loading",
  });
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const loadClasses = async () => {
      try {
        const response = await fetch("/api/classes", {
          cache: "no-store",
          signal: controller.signal,
        });
        const body: unknown = await response.json();
        if (controller.signal.aborted) return;
        if (!response.ok) {
          setClassState({ status: "error", error: getClassLoadError(body) });
          return;
        }
        if (
          !isRecord(body) ||
          !Array.isArray(body.classes) ||
          !body.classes.every(isTeacherClass)
        ) {
          throw new Error("Invalid classes response");
        }
        setClassState({ status: "ready", classes: body.classes });
      } catch {
        if (!controller.signal.aborted) {
          setClassState({ status: "error", error: "loadFailed" });
        }
      }
    };
    void loadClasses();
    return () => controller.abort();
  }, [loadAttempt]);

  const hasSelectedClass =
    classState.status === "ready" &&
    classState.classes.some(
      (schoolClass) => String(schoolClass.id) === formValues.classId,
    );

  const reloadClasses = () => {
    setClassState({ status: "loading" });
    setFormValues((values) => ({ ...values, classId: "" }));
    setLoadAttempt((attempt) => attempt + 1);
  };

  const calculatedSlotCount =
    formValues.startTime && formValues.endTime
      ? getSlotCount(
          formValues.startTime,
          formValues.endTime,
          Number(formValues.slotDurationMinutes),
        )
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

    if (!hasSelectedClass) {
      errors.classId = text.required;
    }

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      submitting.current ||
      classState.status !== "ready" ||
      classState.classes.length === 0
    )
      return;

    if (!validateForm()) return;

    submitting.current = true;
    setIsSubmitting(true);
    setSubmitFailed(false);
    try {
      await onCreateSession({
        classId: Number(formValues.classId),
        title: formValues.title,
        description: formValues.description,
        date: formValues.date,
        startTime: formValues.startTime,
        endTime: formValues.endTime,
        slotDurationMinutes: Number(formValues.slotDurationMinutes),
      });
      // The parent closes the dialog after a successful response.
      // Keep the entered values here if the request is rejected.
    } catch {
      setSubmitFailed(true);
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
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
          {classState.status === "loading" && (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              {text.loading}
            </Alert>
          )}
          {classState.status === "error" && (
            <Stack spacing={1} sx={{ alignItems: "flex-start" }}>
              <Alert severity="error" sx={{ borderRadius: 3 }}>
                {text[classState.error]}
              </Alert>
              <Button
                onClick={reloadClasses}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                {text.retry}
              </Button>
            </Stack>
          )}
          {classState.status === "ready" && classState.classes.length === 0 && (
            <Stack spacing={1} sx={{ alignItems: "flex-start" }}>
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                {text.empty}
              </Alert>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshOutlinedIcon />}
                onClick={reloadClasses}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                  px: 2.5,
                  py: 1.1,
                }}
              >
                {text.refresh}
              </Button>
            </Stack>
          )}
          {submitFailed && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {text.submitFailed}
            </Alert>
          )}
          <TextField
            select
            label={text.label}
            fullWidth
            value={formValues.classId}
            onChange={(event) => handleChange("classId", event.target.value)}
            disabled={
              isSubmitting ||
              classState.status !== "ready" ||
              classState.classes.length === 0
            }
            error={Boolean(formErrors.classId)}
            helperText={formErrors.classId ?? text.helper}
            slotProps={{
              input: {
                startAdornment: (
                  <SchoolOutlinedIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              },
            }}
            sx={textFieldSx}
          >
            <MenuItem value="" disabled>
              {text.placeholder}
            </MenuItem>
            {classState.status === "ready" &&
              classState.classes.map((schoolClass) => (
                <MenuItem key={schoolClass.id} value={String(schoolClass.id)}>
                  {schoolClass.name}
                </MenuItem>
              ))}
          </TextField>

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

          <TextField
            select
            label={t.bookingSession.slotDuration}
            fullWidth
            value={formValues.slotDurationMinutes}
            onChange={(event) =>
              handleChange("slotDurationMinutes", event.target.value)
            }
            slotProps={{
              input: {
                startAdornment: (
                  <TimerOutlinedIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              },
            }}
            sx={textFieldSx}
          >
            {SLOT_DURATION_OPTIONS.map((duration) => (
              <MenuItem key={duration} value={String(duration)}>
                {duration} minuter
              </MenuItem>
            ))}
          </TextField>

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
              disabled={
                isSubmitting ||
                classState.status !== "ready" ||
                classState.classes.length === 0
              }
              startIcon={<AddRoundedIcon />}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                px: 3,
                py: 1.1,
              }}
            >
              {isSubmitting
                ? text.submitting
                : t.createSessionForm.submitButton}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
