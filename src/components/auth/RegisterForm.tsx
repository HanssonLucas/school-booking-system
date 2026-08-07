"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import {
  Alert,
  Box,
  Button,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import type { AuthUser, UserRole } from "@/types/auth";
import { useTranslations } from "@/i18n/useTranslations";

type RegisterResponse = {
  user?: AuthUser;
  error?: string;
  message?: string;
};

const getRedirectPath = (user: AuthUser) => {
  return user.role === "teacher" ? "/teacher" : "/student";
};

export default function RegisterForm() {
  const router = useRouter();
  const { t } = useTranslations();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState<UserRole>("student");
  const [teacherSignupCode, setTeacherSignupCode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getErrorMessage = (errorCode?: string, message?: string) => {
    if (message) {
      return message;
    }

    switch (errorCode) {
      case "MISSING_REGISTER_FIELDS":
        return t.auth.missingFields;
      case "INVALID_EMAIL":
        return t.auth.invalidEmail;
      case "INVALID_PASSWORD":
        return t.auth.invalidPassword;
      case "EMAIL_ALREADY_EXISTS":
        return t.auth.emailAlreadyExists;
      case "INVALID_TEACHER_SIGNUP_CODE":
        return t.auth.invalidTeacherSignupCode;
      default:
        return t.auth.fallbackError;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          teacherSignupCode: role === "teacher" ? teacherSignupCode : undefined,
        }),
      });

      const data = (await response.json()) as RegisterResponse;

      if (!response.ok || !data.user) {
        setError(getErrorMessage(data.error, data.message));
        return;
      }

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
        maxWidth: 560,
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
            {t.auth.registerTitle}
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
            {t.auth.registerDescription}
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
              label={t.auth.nameLabel}
              value={name}
              onChange={(event) => setName(event.target.value)}
              fullWidth
              required
            />

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

            <TextField
              select
              label={t.auth.roleLabel}
              value={role}
              onChange={(event) => {
                const newRole = event.target.value as UserRole;

                setRole(newRole);

                if (newRole === "student") {
                  setTeacherSignupCode("");
                }
              }}
              fullWidth
              required
            >
              <MenuItem value="student">{t.auth.studentRole}</MenuItem>
              <MenuItem value="teacher">{t.auth.teacherRole}</MenuItem>
            </TextField>

            {role === "teacher" && (
              <TextField
                label={t.auth.teacherSignupCodeLabel}
                type="password"
                value={teacherSignupCode}
                onChange={(event) => setTeacherSignupCode(event.target.value)}
                helperText={t.auth.teacherSignupCodeHelper}
                fullWidth
                required
              />
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<PersonAddAltOutlinedIcon />}
              disabled={isSubmitting}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                py: 1.25,
              }}
            >
              {isSubmitting ? t.auth.registeringButton : t.auth.registerButton}
            </Button>
          </Stack>
        </Box>

        <Typography color="text.secondary" sx={{ textAlign: "center" }}>
          {t.auth.alreadyHaveAccount}{" "}
          <Link component={NextLink} href="/login" sx={{ fontWeight: 800 }}>
            {t.auth.goToLogin}
          </Link>
        </Typography>
      </Stack>
    </Paper>
  );
}
