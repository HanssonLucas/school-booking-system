"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useTranslations } from "@/i18n/useTranslations";
import type { BookingLanguage } from "@/types/booking";
import type { AuthUser } from "@/types/auth";

type BookSessionDialogProps = {
  open: boolean;
  sessionTitle?: string;
  currentUser: AuthUser | null;
  isAuthLoading: boolean;
  onClose: () => void;
  onSubmit: (
    language: BookingLanguage,
  ) => Promise<{ success: boolean; message?: string }>;
};

export default function BookSessionDialog({
  open,
  sessionTitle,
  currentUser,
  isAuthLoading,
  onClose,
  onSubmit,
}: BookSessionDialogProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { t, language } = useTranslations();

  const isStudent = currentUser?.role === "student";

  const handleClose = () => {
    setErrorMessage("");
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isAuthLoading) {
      return;
    }

    if (!currentUser) {
      setErrorMessage(t.auth.studentLoginRequired);
      return;
    }

    if (!isStudent) {
      setErrorMessage(t.auth.studentActionForbidden);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const result = await onSubmit(language);

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message ?? t.bookSessionDialog.fallbackError);
    }
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
          {isAuthLoading && (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              {t.auth.loadingUser}
            </Alert>
          )}

          {!isAuthLoading && !currentUser && (
            <Alert severity="warning" sx={{ borderRadius: 3 }}>
              {t.auth.studentLoginRequired}
            </Alert>
          )}

          {!isAuthLoading && currentUser && !isStudent && (
            <Alert severity="warning" sx={{ borderRadius: 3 }}>
              {t.auth.studentActionForbidden}
            </Alert>
          )}

          {!isAuthLoading && currentUser && isStudent && (
            <Alert
              severity="info"
              icon={<PersonOutlineOutlinedIcon />}
              sx={{ borderRadius: 3 }}
            >
              {t.auth.bookingAs}{" "}
              <Box component="span" sx={{ fontWeight: 900 }}>
                {currentUser.name}
              </Box>{" "}
              ({currentUser.email})
            </Alert>
          )}

          {errorMessage && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {errorMessage}
            </Alert>
          )}

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
              {t.bookSessionDialog.cancelButton}
            </Button>

            {!currentUser && !isAuthLoading ? (
              <Button
                variant="contained"
                startIcon={<LoginOutlinedIcon />}
                onClick={() => router.push("/login")}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                  px: 2.5,
                }}
              >
                {t.auth.loginButton}
              </Button>
            ) : (
              <Button
                variant="contained"
                type="submit"
                disabled={isSubmitting || isAuthLoading || !isStudent}
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
            )}
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
