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
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useTranslations } from "@/i18n/useTranslations";
import type { AuthUser } from "@/types/auth";

type CancelBookingDialogProps = {
  open: boolean;
  sessionTitle?: string;
  currentUser: AuthUser | null;
  isAuthLoading: boolean;
  onClose: () => void;
  onSubmit: () => Promise<{ success: boolean; message?: string }>;
};

export default function CancelBookingDialog({
  open,
  sessionTitle,
  currentUser,
  isAuthLoading,
  onClose,
  onSubmit,
}: CancelBookingDialogProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { t } = useTranslations();

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

    if (!currentUser.emailVerified) {
      setErrorMessage(t.auth.emailVerificationRequired);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const result = await onSubmit();

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message ?? t.cancelBookingDialog.fallbackError);
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
              {t.auth.cancellingAs}{" "}
              <Box component="span" sx={{ fontWeight: 900 }}>
                {currentUser.name}
              </Box>{" "}
              ({currentUser.email})
            </Alert>
          )}

          {!isAuthLoading &&
            currentUser &&
            isStudent &&
            !currentUser.emailVerified && (
              <Alert severity="warning" sx={{ borderRadius: 3 }}>
                {t.auth.emailVerificationRequired}
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
              {t.cancelBookingDialog.cancelButton}
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
            ) : currentUser && isStudent && !currentUser.emailVerified ? (
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
            ) : (
              <Button
                variant="contained"
                color="error"
                type="submit"
                disabled={isSubmitting || isAuthLoading || !isStudent}
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
            )}
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
