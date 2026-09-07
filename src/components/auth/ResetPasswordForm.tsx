"use client";

import { useState } from "react";

import NextLink from "next/link";
import { useSearchParams } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";

import { useAuth } from "@/components/auth/useAuth";
import { useTranslations } from "@/i18n/useTranslations";
import PasswordField from "@/components/auth/PasswordField";

type ResetPasswordResponse = {
  success?: boolean;
  error?: string;
};

type TokenErrorKey = "missingToken" | "invalidToken" | "expiredToken";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { refreshUser } = useAuth();
  const { t } = useTranslations();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<TokenErrorKey | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const displayedTokenError: TokenErrorKey | null = token
    ? tokenError
    : "missingToken";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    setFormError(null);

    if (newPassword !== confirmPassword) {
      setFormError(t.passwordReset.passwordsDoNotMatch);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = (await response.json()) as ResetPasswordResponse;

      if (!response.ok || !data.success) {
        if (data.error === "PASSWORD_RESET_RATE_LIMITED") {
          setFormError(t.passwordReset.rateLimited);
          return;
        }
        if (data.error === "EXPIRED_PASSWORD_RESET_TOKEN") {
          setTokenError("expiredToken");
          return;
        }

        if (data.error === "INVALID_PASSWORD_RESET_TOKEN") {
          setTokenError("invalidToken");
          return;
        }

        if (data.error === "INVALID_PASSWORD") {
          setFormError(t.auth.invalidPassword);
          return;
        }

        setFormError(t.passwordReset.fallbackError);
        return;
      }

      await refreshUser();

      localStorage.setItem("auth-user-updated", Date.now().toString());

      setIsSuccess(true);
    } catch {
      setFormError(t.passwordReset.fallbackError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper
      sx={{
        width: "100%",
        maxWidth: 520,
        mx: "auto",
        p: { xs: 3, sm: 4 },
        borderRadius: 5,
        border: 1,
        borderColor: "divider",
        boxShadow: 3,
      }}
    >
      {isSuccess ? (
        <Stack
          spacing={3}
          sx={{
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 88,
              height: 88,
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              bgcolor: "success.main",
              color: "success.contrastText",
              boxShadow: 3,
            }}
          >
            <CheckCircleOutlineRoundedIcon sx={{ fontSize: 52 }} />
          </Box>

          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 900, letterSpacing: -0.7 }}
            >
              {t.passwordReset.resetSuccessTitle}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 1.5, lineHeight: 1.7 }}
            >
              {t.passwordReset.resetSuccessMessage}
            </Typography>
          </Box>

          <Button
            component={NextLink}
            href="/login"
            variant="contained"
            size="large"
            startIcon={<ArrowBackOutlinedIcon />}
            sx={{
              width: "100%",
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 800,
              py: 1.25,
            }}
          >
            {t.auth.goToLogin}
          </Button>
        </Stack>
      ) : displayedTokenError ? (
        <Stack
          spacing={3}
          sx={{
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 88,
              height: 88,
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              bgcolor: "error.main",
              color: "error.contrastText",
              boxShadow: 3,
            }}
          >
            <ErrorOutlineRoundedIcon sx={{ fontSize: 52 }} />
          </Box>

          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 900, letterSpacing: -0.7 }}
            >
              {t.passwordReset.resetTitle}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 1.5, lineHeight: 1.7 }}
            >
              {t.passwordReset[displayedTokenError]}
            </Typography>
          </Box>

          <Button
            component={NextLink}
            href="/forgot-password"
            variant="contained"
            size="large"
            startIcon={<LockResetOutlinedIcon />}
            sx={{
              width: "100%",
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 800,
              py: 1.25,
            }}
          >
            {t.passwordReset.requestButton}
          </Button>

          <Link component={NextLink} href="/login" sx={{ fontWeight: 800 }}>
            {t.passwordReset.backToLogin}
          </Link>
        </Stack>
      ) : (
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 900, letterSpacing: -0.7 }}
            >
              {t.passwordReset.resetTitle}
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
              {t.passwordReset.resetDescription}
            </Typography>
          </Box>

          {formError && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {formError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <PasswordField
                label={t.passwordReset.newPasswordLabel}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                fullWidth
                required
              />

              <PasswordField
                label={t.passwordReset.confirmPasswordLabel}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                fullWidth
                required
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<LockResetOutlinedIcon />}
                disabled={isSubmitting}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                  py: 1.25,
                }}
              >
                {isSubmitting
                  ? t.passwordReset.resettingButton
                  : t.passwordReset.resetButton}
              </Button>
            </Stack>
          </Box>

          <Link
            component={NextLink}
            href="/login"
            sx={{
              alignSelf: "center",
              fontWeight: 800,
            }}
          >
            {t.passwordReset.backToLogin}
          </Link>
        </Stack>
      )}
    </Paper>
  );
}
