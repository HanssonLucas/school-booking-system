"use client";

import { useState } from "react";

import NextLink from "next/link";

import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";

import { useTranslations } from "@/i18n/useTranslations";

type ForgotPasswordResponse = {
  success?: boolean;
  error?: string;
};

export default function ForgotPasswordForm() {
  const { t, language } = useTranslations();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getErrorMessage = (errorCode?: string) => {
    switch (errorCode) {
      case "MISSING_EMAIL":
        return t.auth.missingFields;

      case "INVALID_EMAIL":
        return t.auth.invalidEmail;

      default:
        return t.auth.fallbackError;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          language,
        }),
      });

      const data = (await response.json()) as ForgotPasswordResponse;

      if (!response.ok || !data.success) {
        setError(getErrorMessage(data.error));
        return;
      }

      setIsSubmitted(true);
    } catch {
      setError(t.auth.fallbackError);
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
      {isSubmitted ? (
        <Stack spacing={3}>
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                mx: "auto",
                mb: 2,
                display: "grid",
                placeItems: "center",
                borderRadius: "50%",
                color: "success.main",
                bgcolor: "success.main",
                backgroundColor: "success.main",
                backgroundImage:
                  "linear-gradient(rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.88))",
              }}
            >
              <MarkEmailReadOutlinedIcon sx={{ fontSize: 34 }} />
            </Box>

            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 900, letterSpacing: -0.7 }}
            >
              {t.passwordReset.requestSuccessTitle}
            </Typography>
          </Box>

          <Alert severity="success" sx={{ borderRadius: 3 }}>
            {t.passwordReset.requestSuccessMessage}
          </Alert>

          <Typography color="text.secondary" sx={{ textAlign: "center" }}>
            {t.passwordReset.requestCheckSpam}
          </Typography>

          <Button
            component={NextLink}
            href="/login"
            variant="outlined"
            size="large"
            startIcon={<ArrowBackOutlinedIcon />}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 800,
              py: 1.25,
            }}
          >
            {t.passwordReset.backToLogin}
          </Button>
        </Stack>
      ) : (
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 900, letterSpacing: -0.7 }}
            >
              {t.passwordReset.requestTitle}
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
              {t.passwordReset.requestDescription}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label={t.auth.emailLabel}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
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
                  ? t.passwordReset.requestingButton
                  : t.passwordReset.requestButton}
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
