"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import type { AuthUser } from "@/types/auth";
import { useTranslations } from "@/i18n/useTranslations";
import { useAuth } from "@/components/auth/useAuth";

type LoginResponse = {
  user?: AuthUser;
  error?: string;
  message?: string;
};

const getRedirectPath = (user: AuthUser) => {
  return user.role === "teacher" ? "/teacher" : "/student";
};

export default function LoginForm() {
  const router = useRouter();
  const { t } = useTranslations();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getErrorMessage = (errorCode?: string, message?: string) => {
    if (message) {
      return message;
    }

    switch (errorCode) {
      case "MISSING_LOGIN_FIELDS":
        return t.auth.missingFields;
      case "INVALID_LOGIN_CREDENTIALS":
        return t.auth.invalidLoginCredentials;
      default:
        return t.auth.fallbackError;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok || !data.user) {
        setError(getErrorMessage(data.error, data.message));
        return;
      }

      await refreshUser();

      router.push(getRedirectPath(data.user));
      router.refresh();
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
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 900, letterSpacing: -0.7 }}
          >
            {t.auth.loginTitle}
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
            {t.auth.loginDescription}
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
              fullWidth
              required
            />

            <TextField
              label={t.auth.passwordLabel}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
              required
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<LoginOutlinedIcon />}
              disabled={isSubmitting}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                py: 1.25,
              }}
            >
              {isSubmitting ? t.auth.loggingInButton : t.auth.loginButton}
            </Button>
          </Stack>
        </Box>

        <Typography color="text.secondary" sx={{ textAlign: "center" }}>
          {t.auth.noAccount}{" "}
          <Link component={NextLink} href="/register" sx={{ fontWeight: 800 }}>
            {t.auth.goToRegister}
          </Link>
        </Typography>
      </Stack>
    </Paper>
  );
}
