"use client";

import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useAuth } from "@/components/auth/useAuth";
import { useTranslations } from "@/i18n/useTranslations";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const { t } = useTranslations();

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

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t.profile.nameLabel}
              </Typography>
              <Typography>{user.name}</Typography>
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
