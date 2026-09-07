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
  Dialog,
  DialogActions,
  DialogContent,
} from "@mui/material";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import type { AuthUser, UserRole } from "@/types/auth";
import { useAuth } from "@/components/auth/useAuth";
import { useTranslations } from "@/i18n/useTranslations";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import PasswordField from "@/components/auth/PasswordField";

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
  const { t, language } = useTranslations();
  const { refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState<UserRole>("student");
  const [teacherSignupCode, setTeacherSignupCode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<AuthUser | null>(null);

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
          language,
        }),
      });

      const data = (await response.json()) as RegisterResponse;

      if (!response.ok || !data.user) {
        setError(getErrorMessage(data.error, data.message));
        return;
      }

      await refreshUser();

      setRegisteredUser(data.user);
    } catch {
      setError(t.auth.fallbackError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (!registeredUser) {
      return;
    }

    router.push(getRedirectPath(registeredUser));
    router.refresh();
  };

  return (
    <>
      <Dialog
        open={registeredUser !== null}
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
              "linear-gradient(135deg, rgba(46, 125, 50, 0.14), rgba(25, 118, 210, 0.08))",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 4,
                display: "grid",
                placeItems: "center",
                bgcolor: "success.main",
                color: "success.contrastText",
                boxShadow: 3,
                flexShrink: 0,
              }}
            >
              <CheckCircleOutlineRoundedIcon />
            </Box>

            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 900,
                letterSpacing: -0.4,
              }}
            >
              {t.auth.registrationSuccessTitle}
            </Typography>
          </Stack>
        </Box>

        <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography color="text.secondary">
                {t.auth.registrationSuccessMessage}
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  fontWeight: 900,
                  wordBreak: "break-word",
                }}
              >
                {registeredUser?.email}
              </Typography>
            </Box>

            <Alert severity="success" sx={{ borderRadius: 3 }}>
              {t.auth.registrationVerificationRequired}
            </Alert>

            <Typography variant="body2" color="text.secondary">
              {t.auth.registrationCheckSpam}
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 3, sm: 4 },
            pb: { xs: 3, sm: 4 },
            pt: 0,
          }}
        >
          <Button
            variant="contained"
            onClick={handleContinue}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 800,
              px: 3,
              py: 1.1,
            }}
          >
            {t.auth.registrationContinueButton}
          </Button>
        </DialogActions>
      </Dialog>

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

              <PasswordField
                label={t.auth.passwordLabel}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
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
                <PasswordField
                  label={t.auth.teacherSignupCodeLabel}
                  value={teacherSignupCode}
                  onChange={(event) => setTeacherSignupCode(event.target.value)}
                  helperText={t.auth.teacherSignupCodeHelper}
                  showLabel={t.auth.showTeacherSignupCode}
                  hideLabel={t.auth.hideTeacherSignupCode}
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
                {isSubmitting
                  ? t.auth.registeringButton
                  : t.auth.registerButton}
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
    </>
  );
}
