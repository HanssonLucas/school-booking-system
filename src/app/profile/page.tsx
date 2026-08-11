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

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

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
        <Alert severity="info">
          Du behöver vara inloggad för att se din profil.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Profil
          </Typography>

          <Typography color="text.secondary">Dina kontouppgifter.</Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Namn
              </Typography>
              <Typography>{user.name}</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                E-post
              </Typography>
              <Typography>{user.email}</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Roll
              </Typography>
              <Typography>{user.role}</Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
