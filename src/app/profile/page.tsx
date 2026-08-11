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
} from "@mui/material";
import { useAuth } from "@/components/auth/useAuth";
import { useTranslations } from "@/i18n/useTranslations";
import { useState, type FormEvent } from "react";

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
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="info">{t.profile.loginRequired}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {t.profile.title}
          </Typography>

          <Typography color="text.secondary">
            {t.profile.description}
          </Typography>
        </Box>

        {feedback && <Alert severity={feedback.type}>{feedback.message}</Alert>}

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
              <Typography>{user.role}</Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
