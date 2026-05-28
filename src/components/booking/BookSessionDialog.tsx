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
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { useTranslations } from "@/i18n/useTranslations";

type BookSessionDialogProps = {
  open: boolean;
  sessionTitle?: string;
  onClose: () => void;
  onSubmit: (
    studentName: string,
    studentEmail: string,
  ) => Promise<{ success: boolean; message?: string }>;
};

export default function BookSessionDialog({
  open,
  sessionTitle,
  onClose,
  onSubmit,
}: BookSessionDialogProps) {
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { t } = useTranslations();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!studentName.trim() || !studentEmail.trim()) {
      setErrorMessage(t.bookSessionDialog.requiredError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const result = await onSubmit(studentName, studentEmail);

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message ?? t.bookSessionDialog.fallbackError);
      return;
    }

    setStudentName("");
    setStudentEmail("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            "linear-gradient(135deg, rgba(25, 118, 210, 0.14), rgba(76, 175, 80, 0.08))",
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
            <EventAvailableOutlinedIcon />
          </Box>

          <Box>
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 900, letterSpacing: -0.4 }}
            >
              {t.bookSessionDialog.title}
            </Typography>

            {sessionTitle && (
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {t.bookSessionDialog.bookingFor}{" "}
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
          {errorMessage && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {errorMessage}
            </Alert>
          )}

          <TextField
            label={t.bookSessionDialog.nameLabel}
            fullWidth
            value={studentName}
            onChange={(event) => setStudentName(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <PersonOutlineOutlinedIcon
                    sx={{ mr: 1, color: "text.secondary" }}
                  />
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
            }}
          />

          <TextField
            label={t.bookSessionDialog.emailLabel}
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
              onClick={onClose}
              disabled={isSubmitting}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                px: 2.5,
              }}
            >
              {t.bookSessionDialog.cancelButton}
            </Button>

            <Button
              variant="contained"
              type="submit"
              disabled={isSubmitting}
              startIcon={<EventAvailableOutlinedIcon />}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                px: 2.5,
              }}
            >
              {isSubmitting
                ? t.bookSessionDialog.submittingButton
                : t.bookSessionDialog.submitButton}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
