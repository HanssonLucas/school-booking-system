"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import TitleOutlinedIcon from "@mui/icons-material/TitleOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import type { BookingSession } from "@/types/booking";
import { useTranslations } from "@/i18n/useTranslations";
import { getSlotCount, SLOT_DURATION_OPTIONS } from "@/lib/bookingSlots";
import { useRouter } from "next/navigation";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useAuth } from "@/components/auth/useAuth";

export type EditFormValues = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: string;
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
  slotDurationMinutes: "15",
  maxParticipants: "",
};

const getInitialFormValues = (
  session: BookingSession | null,
): EditFormValues => {
  if (!session) {
    return initialFormValues;
  }

  return {
    title: session.title,
    description: session.description,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    slotDurationMinutes: String(session.slotDurationMinutes),
    maxParticipants: String(session.maxParticipants),
  };
};

export default function EditBookingSessionDialog(
  props: EditBookingSessionDialogProps,
) {
  return (
    <EditBookingSessionDialogContent
      key={props.session?.id ?? "empty-session"}
      {...props}
    />
  );
}

function EditBookingSessionDialogContent({
  open,
  session,
  onClose,
  onSave,
}: EditBookingSessionDialogProps) {
  const [formValues, setFormValues] = useState<EditFormValues>(() =>
    getInitialFormValues(session),
  );

  const { t } = useTranslations();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const calculatedSlotCount =
    formValues.startTime && formValues.endTime
      ? getSlotCount(
          formValues.startTime,
          formValues.endTime,
          Number(formValues.slotDurationMinutes),
        )
      : 0;

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

    onSave(session.id, {
      ...formValues,
      maxParticipants: String(calculatedSlotCount),
    });
  };

  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 5,
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Paper
          elevation={0}
          sx={{
            overflow: "hidden",
            borderRadius: 0,
          }}
        >
          <Box
            sx={{
              p: { xs: 3, sm: 4 },
              pb: 2,
              background:
                "linear-gradient(135deg, rgba(25, 118, 210, 0.14), rgba(156, 39, 176, 0.08))",
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
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  boxShadow: 3,
                  flexShrink: 0,
                }}
              >
                <EditOutlinedIcon />
              </Box>

              <Box>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{ fontWeight: 900, letterSpacing: -0.4 }}
                >
                  {t.editSessionDialog.title}
                </Typography>

                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  {t.bookingSession.slotDuration}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {currentUser && !currentUser.emailVerified ? (
            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              <Stack spacing={3}>
                <Alert severity="warning" sx={{ borderRadius: 3 }}>
                  {t.auth.teacherEmailVerificationRequired}
                </Alert>

                <DialogActions
                  sx={{
                    px: 0,
                    pt: 1,
                    gap: 1,
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    onClick={onClose}
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 800,
                      px: 2.5,
                    }}
                  >
                    {t.editSessionDialog.cancelButton}
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<PersonOutlineOutlinedIcon />}
                    onClick={() => router.push("/profile")}
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 800,
                      px: 2.5,
                    }}
                  >
                    {t.profile.title}
                  </Button>
                </DialogActions>
              </Stack>
            </Box>
          ) : (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ p: { xs: 3, sm: 4 } }}
            >
              <Stack spacing={3}>
                <TextField
                  label={t.editSessionDialog.titleLabel}
                  fullWidth
                  value={formValues.title}
                  onChange={(event) =>
                    handleChange("title", event.target.value)
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <TitleOutlinedIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                      ),
                    },
                  }}
                  sx={textFieldSx}
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
                    label={t.editSessionDialog.dateLabel}
                    type="date"
                    fullWidth
                    value={formValues.date}
                    onChange={(event) =>
                      handleChange("date", event.target.value)
                    }
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
                    sx={textFieldSx}
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
                      input: {
                        startAdornment: (
                          <AccessTimeOutlinedIcon
                            sx={{ mr: 1, color: "text.secondary" }}
                          />
                        ),
                      },
                    }}
                    sx={textFieldSx}
                  />

                  <TextField
                    label={t.editSessionDialog.endTimeLabel}
                    type="time"
                    fullWidth
                    value={formValues.endTime}
                    onChange={(event) =>
                      handleChange("endTime", event.target.value)
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
                        <TimerOutlinedIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
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

                <DialogActions
                  sx={{
                    px: 0,
                    pt: 1,
                    gap: 1,
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    onClick={onClose}
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 800,
                      px: 2.5,
                    }}
                  >
                    {t.editSessionDialog.cancelButton}
                  </Button>

                  <Button
                    variant="contained"
                    type="submit"
                    startIcon={<EditOutlinedIcon />}
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 800,
                      px: 3,
                      py: 1.1,
                    }}
                  >
                    {t.editSessionDialog.saveButton}
                  </Button>
                </DialogActions>
              </Stack>
            </Box>
          )}
        </Paper>
      </DialogContent>
    </Dialog>
  );
}
