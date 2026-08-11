"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useAuth } from "@/components/auth/useAuth";
import { useTranslations } from "@/i18n/useTranslations";
import { useState, type FormEvent } from "react";
import AppHeader from "@/components/layout/AppHeader";

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useAuth();
  const { t } = useTranslations();

  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleEditName = () => {
    if (!user) {
      return;
    }

    setName(user.name);
    setFeedback(null);
    setIsEditingName(true);
  };

  const handleCancelNameEdit = () => {
    setName("");
    setFeedback(null);
    setIsEditingName(false);
  };

  const handleCancelPasswordEdit = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordFeedback(null);
    setIsEditingPassword(false);
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setPasswordFeedback({
        type: "error",
        message: t.profile.passwordMismatch,
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordFeedback({
        type: "error",
        message: t.profile.invalidPassword,
      });
      return;
    }

    setIsSavingPassword(true);
    setPasswordFeedback(null);

    try {
      const response = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as {
          code?: string;
        };

        let message: string = t.profile.passwordUpdateFailed;

        if (data.code === "CURRENT_PASSWORD_INCORRECT") {
          message = t.profile.currentPasswordIncorrect;
        }

        if (data.code === "INVALID_PASSWORD") {
          message = t.profile.invalidPassword;
        }

        setPasswordFeedback({
          type: "error",
          message,
        });

        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setIsEditingPassword(false);

      setPasswordFeedback({
        type: "success",
        message: t.profile.passwordUpdated,
      });
    } catch {
      setPasswordFeedback({
        type: "error",
        message: t.profile.passwordUpdateFailed,
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleNameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (trimmedName.length < 1 || trimmedName.length > 80) {
      setFeedback({
        type: "error",
        message: t.profile.invalidName,
      });
      return;
    }

    setIsSavingName(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as {
          code?: string;
        };

        setFeedback({
          type: "error",
          message:
            data.code === "INVALID_NAME"
              ? t.profile.invalidName
              : t.profile.updateFailed,
        });

        return;
      }

      await refreshUser();

      setName("");
      setIsEditingName(false);
      setFeedback({
        type: "success",
        message: t.profile.nameUpdated,
      });
    } catch {
      setFeedback({
        type: "error",
        message: t.profile.updateFailed,
      });
    } finally {
      setIsSavingName(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <AppHeader />

        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <AppHeader />

        <Container maxWidth="sm" sx={{ py: 6 }}>
          <Alert severity="info">{t.profile.loginRequired}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppHeader />

      <Container sx={{ py: { xs: 4, md: 7 } }}>
        <Stack spacing={3}>
          <Paper
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 6,
              p: { xs: 3, sm: 5 },
              mb: 2,
              border: 1,
              borderColor: "divider",
              background:
                "linear-gradient(135deg, rgba(25, 118, 210, 0.14), rgba(156, 39, 176, 0.08))",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                width: 220,
                height: 220,
                borderRadius: "50%",
                bgcolor: "primary.main",
                opacity: 0.12,
                right: -70,
                top: -80,
              }}
            />

            <Box
              sx={{
                position: "absolute",
                width: 160,
                height: 160,
                borderRadius: "50%",
                bgcolor: "secondary.main",
                opacity: 0.1,
                right: 120,
                bottom: -80,
              }}
            />

            <Box sx={{ position: "relative", maxWidth: 760 }}>
              <Chip
                icon={<PersonOutlineOutlinedIcon />}
                label={`${user.name} · ${
                  user.role === "teacher"
                    ? t.auth.teacherRole
                    : t.auth.studentRole
                }`}
                sx={{
                  mb: 3,
                  borderRadius: 999,
                  fontWeight: 800,
                  bgcolor: "background.paper",
                }}
              />

              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 900,
                  letterSpacing: -1.3,
                  lineHeight: 1.05,
                  fontSize: { xs: "2.25rem", md: "3.5rem" },
                  mb: 2,
                }}
              >
                {t.profile.title}
              </Typography>

              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  lineHeight: 1.7,
                  maxWidth: 680,
                }}
              >
                {t.profile.description}
              </Typography>
            </Box>
          </Paper>

          {feedback && (
            <Alert severity={feedback.type}>{feedback.message}</Alert>
          )}

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t.profile.nameLabel}
                </Typography>

                {isEditingName ? (
                  <Stack
                    component="form"
                    onSubmit={handleNameSubmit}
                    spacing={1.5}
                    sx={{ mt: 1 }}
                  >
                    <TextField
                      label={t.profile.nameInputLabel}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      disabled={isSavingName}
                      autoFocus
                      fullWidth
                    />

                    <Stack direction="row" spacing={1}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSavingName}
                      >
                        {t.profile.save}
                      </Button>

                      <Button
                        type="button"
                        onClick={handleCancelNameEdit}
                        disabled={isSavingName}
                      >
                        {t.profile.cancel}
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography>{user.name}</Typography>

                    <Button size="small" onClick={handleEditName}>
                      {t.profile.editName}
                    </Button>
                  </Stack>
                )}
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t.profile.emailLabel}
                </Typography>
                <Typography>{user.email}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t.profile.roleLabel}
                </Typography>

                <Typography>
                  {user.role === "teacher"
                    ? t.auth.teacherRole
                    : t.auth.studentRole}
                </Typography>
              </Box>
            </Stack>
          </Paper>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">{t.profile.changePassword}</Typography>

              {passwordFeedback && (
                <Alert severity={passwordFeedback.type}>
                  {passwordFeedback.message}
                </Alert>
              )}

              {isEditingPassword ? (
                <Stack
                  component="form"
                  onSubmit={handlePasswordSubmit}
                  spacing={2}
                >
                  <TextField
                    label={t.profile.currentPasswordLabel}
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    disabled={isSavingPassword}
                    autoComplete="current-password"
                    fullWidth
                  />

                  <TextField
                    label={t.profile.newPasswordLabel}
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    disabled={isSavingPassword}
                    autoComplete="new-password"
                    fullWidth
                  />

                  <TextField
                    label={t.profile.confirmNewPasswordLabel}
                    type="password"
                    value={confirmNewPassword}
                    onChange={(event) =>
                      setConfirmNewPassword(event.target.value)
                    }
                    disabled={isSavingPassword}
                    autoComplete="new-password"
                    fullWidth
                  />

                  <Stack direction="row" spacing={1}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSavingPassword}
                    >
                      {t.profile.save}
                    </Button>

                    <Button
                      type="button"
                      onClick={handleCancelPasswordEdit}
                      disabled={isSavingPassword}
                    >
                      {t.profile.cancel}
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Box>
                  <Button
                    onClick={() => {
                      setPasswordFeedback(null);
                      setIsEditingPassword(true);
                    }}
                  >
                    {t.profile.changePassword}
                  </Button>
                </Box>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
