"use client";

import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import type { CreateBookingSessionInput } from "@/types/booking";
import { useTranslations } from "@/i18n/useTranslations";
import { getSlotCount } from "@/lib/bookingSlots";
import BookingDialogHeader from "@/components/booking/BookingDialogHeader";
import SessionDetailsFields from "@/components/booking/SessionDetailsField";
import SessionDateTimeFields from "@/components/booking/SessionDateTimeFields";
import SessionSlotFields from "@/components/booking/SessionSlotFields";

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
  initialClassId?: number | null;
  onCreateSession: (session: CreateBookingSessionInput) => void | Promise<void>;
  onClose?: () => void;
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
  initialClassId = null,
  onClose,
}: CreateBookingSessionFormProps) {
  const [formValues, setFormValues] = useState<FormValues>(() => ({
    ...initialFormValues,
    classId:
      initialClassId !== null &&
      Number.isSafeInteger(initialClassId) &&
      initialClassId > 0
        ? String(initialClassId)
        : "",
  }));
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
    <Box>
      <BookingDialogHeader
        id="create-session-heading"
        eyebrow={t.bookingSession.dialogEyebrow}
        title={t.createSessionForm.title}
        description={t.bookingSession.formDescription}
        onClose={onClose}
      />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          px: { xs: 2.5, sm: 4 },
          py: 3,
        }}
      >
        <Stack spacing={2}>
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
                onClick={reloadClasses}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                {text.refresh}
              </Button>
            </Stack>
          )}
          {classState.status === "ready" &&
            formValues.classId !== "" &&
            !hasSelectedClass && (
              <Alert severity="warning" sx={{ borderRadius: 3 }}>
                {t.teacherClasses.classFilterUnavailable}
              </Alert>
            )}
          {submitFailed && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {text.submitFailed}
            </Alert>
          )}
          <Typography
            component="h3"
            variant="subtitle1"
            sx={{ fontWeight: 800, letterSpacing: -0.2 }}
          >
            {t.bookingSession.detailsHeading}
          </Typography>
          <TextField
            select
            label={text.label}
            fullWidth
            value={hasSelectedClass ? formValues.classId : ""}
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

          <SessionDetailsFields
            title={formValues.title}
            description={formValues.description}
            titleLabel={t.createSessionForm.titleLabel}
            descriptionLabel={t.createSessionForm.descriptionLabel}
            onTitleChange={(value) => handleChange("title", value)}
            onDescriptionChange={(value) => handleChange("description", value)}
            titleError={formErrors.title}
            descriptionError={formErrors.description}
          />
          <Typography
            component="h3"
            variant="subtitle1"
            sx={{
              pt: 1,
              fontWeight: 800,
              letterSpacing: -0.2,
            }}
          >
            {t.bookingSession.scheduleHeading}
          </Typography>

          <SessionDateTimeFields
            values={formValues}
            labels={{
              date: t.createSessionForm.dateLabel,
              startTime: t.createSessionForm.startTimeLabel,
              endTime: t.createSessionForm.endTimeLabel,
            }}
            errors={formErrors}
            onChange={handleChange}
          />

          <SessionSlotFields
            value={formValues.slotDurationMinutes}
            startTime={formValues.startTime}
            endTime={formValues.endTime}
            calculatedSlotCount={calculatedSlotCount}
            onChange={(value) => handleChange("slotDurationMinutes", value)}
          />

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
    </Box>
  );
}
