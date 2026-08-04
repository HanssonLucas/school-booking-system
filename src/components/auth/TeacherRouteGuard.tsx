"use client";

import { useEffect, useState, type ReactNode } from "react";
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
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import type { AuthUser } from "@/types/auth";
import { useTranslations } from "@/i18n/useTranslations";

type TeacherRouteGuardProps = {
  children: ReactNode;
};

type MeResponse = {
  user: AuthUser | null;
};

export default function TeacherRouteGuard({
  children,
}: TeacherRouteGuardProps) {
  const router = useRouter();
  const { t } = useTranslations();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = (await response.json()) as MeResponse;

        if (isMounted) {
          setUser(data.user);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
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
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <CircularProgress />

            <Typography color="text.secondary">
              {t.auth.checkingAccess}
            </Typography>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (!user) {
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
          <Stack spacing={3} sx={{ maxWidth: 680 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 4,
                display: "grid",
                placeItems: "center",
                bgcolor: "warning.main",
                color: "warning.contrastText",
                boxShadow: 3,
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
                {t.auth.teacherAccessTitle}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1, lineHeight: 1.7 }}
              >
                {t.auth.teacherLoginRequiredDescription}
              </Typography>
            </Box>

            <Alert severity="info" sx={{ borderRadius: 3 }}>
              {t.auth.teacherLoginRequiredDescription}
            </Alert>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                startIcon={<LoginOutlinedIcon />}
                onClick={() => router.push("/login")}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                  px: 3,
                }}
              >
                {t.auth.loginButton}
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
        </Paper>
      </Container>
    );
  }

  if (user.role !== "teacher") {
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
          <Stack spacing={3} sx={{ maxWidth: 680 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 4,
                display: "grid",
                placeItems: "center",
                bgcolor: "error.main",
                color: "error.contrastText",
                boxShadow: 3,
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
                {t.auth.teacherAccessTitle}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1, lineHeight: 1.7 }}
              >
                {t.auth.teacherForbiddenDescription}
              </Typography>
            </Box>

            <Alert severity="warning" sx={{ borderRadius: 3 }}>
              {t.auth.teacherForbiddenDescription}
            </Alert>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                startIcon={<SchoolOutlinedIcon />}
                onClick={() => router.push("/student")}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                  px: 3,
                }}
              >
                {t.home.goToStudentView}
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
        </Paper>
      </Container>
    );
  }

  return <>{children}</>;
}
