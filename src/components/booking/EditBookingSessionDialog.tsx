"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useRouter } from "next/navigation";
import type { BookingSession } from "@/types/booking";
import { useTranslations } from "@/i18n/useTranslations";
import { getSlotCount } from "@/lib/bookingSlots";
import { useAuth } from "@/components/auth/useAuth";
import SessionDialogHeader from "@/components/booking/SessionDialogHeader";
import SessionDetailsFields from "@/components/booking/SessionDetailsField";
import SessionDateTimeFields from "@/components/booking/SessionDateTimeFields";
import SessionSlotFields from "@/components/booking/SessionSlotFields";

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
  if (!session) return initialFormValues;

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

    if (!session) return;

    onSave(session.id, {
      ...formValues,
      maxParticipants: String(calculatedSlotCount),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={currentUser?.emailVerified === false ? "sm" : "md"}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            backgroundImage: "none",
            maxWidth: currentUser?.emailVerified === false ? 600 : 720,
          },
        },
      }}
    >
      <SessionDialogHeader
        title={t.editSessionDialog.title}
        description={t.bookingSession.formDescription}
        icon={<EditOutlinedIcon />}
        onClose={onClose}
      />

      <DialogContent
        sx={{
          px: { xs: 2.5, sm: 4 },
          py: 3,
        }}
      >
        {currentUser && !currentUser.emailVerified ? (
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
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Typography
                component="h3"
                variant="subtitle1"
                sx={{ fontWeight: 800, letterSpacing: -0.2 }}
              >
                {t.bookingSession.detailsHeading}
              </Typography>

              <SessionDetailsFields
                title={formValues.title}
                description={formValues.description}
                titleLabel={t.editSessionDialog.titleLabel}
                descriptionLabel={t.editSessionDialog.descriptionLabel}
                onTitleChange={(value) => handleChange("title", value)}
                onDescriptionChange={(value) =>
                  handleChange("description", value)
                }
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
                  date: t.editSessionDialog.dateLabel,
                  startTime: t.editSessionDialog.startTimeLabel,
                  endTime: t.editSessionDialog.endTimeLabel,
                }}
                onChange={handleChange}
              />

              <SessionSlotFields
                value={formValues.slotDurationMinutes}
                calculatedSlotCount={calculatedSlotCount}
                onChange={(value) => handleChange("slotDurationMinutes", value)}
              />

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
      </DialogContent>
    </Dialog>
  );
}
