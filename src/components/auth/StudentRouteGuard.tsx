"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import { useAuth } from "@/components/auth/useAuth";
import { useTranslations } from "@/i18n/useTranslations";

type Props = { children: ReactNode };

export default function StudentRouteGuard({ children }: Props) {
  const router = useRouter();
  const { t } = useTranslations();
  const { user, isLoading } = useAuth();

  if (!isLoading && user?.role === "student") {
    return <>{children}</>;
  }

  return (
    <Container sx={{ py: { xs: 4, md: 7 } }}>
      <Paper
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 5,
          border: 1,
          borderColor: "divider",
          boxShadow: 1,
        }}
      >
        {isLoading ? (
          <Stack
            spacing={2}
            role="status"
            sx={{ alignItems: "center", textAlign: "center" }}
          >
            <CircularProgress />
            <Typography color="text.secondary">
              {t.auth.checkingAccess}
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={3} sx={{ maxWidth: 680 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 4,
                display: "grid",
                placeItems: "center",
                boxShadow: 3,
                bgcolor: user ? "error.main" : "warning.main",
                color: user ? "error.contrastText" : "warning.contrastText",
              }}
            >
              <LockOutlinedIcon />
            </Box>
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 900, letterSpacing: -0.7 }}
              >
                {t.studentAccess.title}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ mt: 1, lineHeight: 1.7 }}
              >
                {t.studentAccess.description}
              </Typography>
            </Box>
            <Alert
              severity={user ? "warning" : "info"}
              sx={{ borderRadius: 3 }}
            >
              {user ? t.studentAccess.forbidden : t.studentAccess.loginRequired}
            </Alert>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                startIcon={
                  user ? <EditCalendarOutlinedIcon /> : <LoginOutlinedIcon />
                }
                onClick={() => router.push(user ? "/teacher" : "/login")}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                  px: 3,
                }}
              >
                {user ? t.home.goToTeacherView : t.auth.loginButton}
              </Button>
              <Button
                variant="outlined"
                startIcon={<HomeOutlinedIcon />}
                onClick={() => router.push("/")}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                  px: 3,
                }}
              >
                {t.auth.goToHome}
              </Button>
            </Stack>
          </Stack>
        )}
      </Paper>
    </Container>
  );
}
