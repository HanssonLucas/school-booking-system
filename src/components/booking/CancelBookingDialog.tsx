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
  TextField,
  Typography,
} from "@mui/material";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { useTranslations } from "@/i18n/useTranslations";

type CancelBookingDialogProps = {
  open: boolean;
  sessionTitle?: string;
  onClose: () => void;
  onSubmit: (
    studentEmail: string,
  ) => Promise<{ success: boolean; message?: string }>;
};

export default function CancelBookingDialog({
  open,
  sessionTitle,
  onClose,
  onSubmit,
}: CancelBookingDialogProps) {
  const [studentEmail, setStudentEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { t } = useTranslations();

  const handleClose = () => {
    setStudentEmail("");
    setErrorMessage("");
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!studentEmail.trim()) {
      setErrorMessage(t.cancelBookingDialog.requiredError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const result = await onSubmit(studentEmail);

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message ?? t.cancelBookingDialog.fallbackError);
      return;
    }

    setStudentEmail("");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
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
      <Box
        sx={{
          p: { xs: 3, sm: 4 },
          pb: 2,
          background:
            "linear-gradient(135deg, rgba(211, 47, 47, 0.14), rgba(255, 152, 0, 0.08))",
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
              bgcolor: "error.main",
              color: "error.contrastText",
              boxShadow: 3,
              flexShrink: 0,
            }}
          >
            <EventBusyOutlinedIcon />
          </Box>

          <Box>
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 900, letterSpacing: -0.4 }}
            >
              {t.cancelBookingDialog.title}
            </Typography>

            {sessionTitle && (
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {t.cancelBookingDialog.cancellingFor}{" "}
                <Box
                  component="span"
                  sx={{ fontWeight: 800, color: "text.primary" }}
                >
                  {sessionTitle}
                </Box>
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={3} component="form" onSubmit={handleSubmit}>
          <Alert
            severity="warning"
            icon={<WarningAmberOutlinedIcon />}
            sx={{ borderRadius: 3 }}
          >
            {t.cancelBookingDialog.description}
          </Alert>

          {errorMessage && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {errorMessage}
            </Alert>
          )}

          <TextField
            label={t.cancelBookingDialog.emailLabel}
            type="email"
            fullWidth
            value={studentEmail}
            onChange={(event) => setStudentEmail(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <EmailOutlinedIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
            }}
          />

          <DialogActions
            sx={{
              px: 0,
              pt: 1,
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Button
              onClick={handleClose}
              disabled={isSubmitting}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                px: 2.5,
              }}
            >
              {t.cancelBookingDialog.cancelButton}
            </Button>

            <Button
              variant="contained"
              color="error"
              type="submit"
              disabled={isSubmitting}
              startIcon={<EventBusyOutlinedIcon />}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                px: 2.5,
              }}
            >
              {isSubmitting
                ? t.cancelBookingDialog.submittingButton
                : t.cancelBookingDialog.submitButton}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
