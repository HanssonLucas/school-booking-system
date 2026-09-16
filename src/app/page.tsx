"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import { useAuth } from "@/components/auth/useAuth";
import AppHeader from "@/components/layout/AppHeader";
import BookingSessionList from "@/components/booking/BookingSessionList";
import { useTranslations } from "@/i18n/useTranslations";
import type { BookingSession } from "@/types/booking";
import HomeHero from "@/components/home/HomeHero";

export default function HomePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslations();

  const handleSelectRole = (role: "student" | "teacher") => {
    router.push(`/${role}`);
  };

  return (
    <>
      <AppHeader />

      <Container sx={{ py: { xs: 4, md: 7 } }}>
        <HomeHero />

        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Card
            sx={{
              flex: 1,
              borderRadius: 5,
              border: 1,
              borderColor: "divider",
              boxShadow: 2,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 4,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  mb: 3,
                  boxShadow: 3,
                }}
              >
                <SchoolOutlinedIcon />
              </Box>

              <Typography
                variant="h5"
                component="h2"
                sx={{ fontWeight: 800, mb: 1 }}
              >
                {t.common.student}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ lineHeight: 1.7, mb: 3 }}
              >
                {t.home.studentCardDescription}
              </Typography>

              <Button
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => handleSelectRole("student")}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                {t.home.goToStudentView}
              </Button>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              borderRadius: 5,
              border: 1,
              borderColor: "divider",
              boxShadow: 2,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 4,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "secondary.main",
                  color: "secondary.contrastText",
                  mb: 3,
                  boxShadow: 3,
                }}
              >
                <EditCalendarOutlinedIcon />
              </Box>

              <Typography
                variant="h5"
                component="h2"
                sx={{ fontWeight: 800, mb: 1 }}
              >
                {t.common.teacher}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ lineHeight: 1.7, mb: 3 }}
              >
                {t.home.teacherCardDescription}
              </Typography>

              <Button
                variant="outlined"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => handleSelectRole("teacher")}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                {t.home.goToTeacherView}
              </Button>
            </CardContent>
          </Card>
        </Stack>

        <Paper
          sx={{
            mt: 6,
            p: { xs: 3, md: 4 },
            borderRadius: 5,
            border: 1,
            borderColor: "divider",
            boxShadow: 1,
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{ fontWeight: 850, letterSpacing: -0.5 }}
              gutterBottom
            >
              {t.home.upcomingSessionsTitle}
            </Typography>

            <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
              {t.home.upcomingSessionsDescription}
            </Typography>
          </Box>

          {isAuthLoading ? (
            <Typography color="text.secondary">{t.auth.loadingUser}</Typography>
          ) : user ? (
            <HomeSessionList key={`${user.id}:${user.role}`} />
          ) : (
            <Button
              href="/login"
              variant="contained"
              startIcon={<LoginOutlinedIcon />}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                px: 2.5,
              }}
            >
              {t.auth.loginButton}
            </Button>
          )}
        </Paper>
      </Container>
    </>
  );
}

// Mounted only after authentication has resolved and a user exists.
type SessionLoadState =
  | { status: "loading" }
  | { status: "ready"; sessions: BookingSession[] }
  | { status: "unauthorized" }
  | { status: "error" };

function HomeSessionList() {
  const { t } = useTranslations();
  const [state, setState] = useState<SessionLoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/booking-sessions", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;

        if (response.status === 401) {
          setState({ status: "unauthorized" });
          return;
        }
        if (!response.ok) {
          setState({ status: "error" });
          return;
        }

        const sessions: unknown = await response.json();
        if (!Array.isArray(sessions)) {
          throw new Error("Invalid sessions response");
        }
        if (!controller.signal.aborted) {
          setState({ status: "ready", sessions: sessions as BookingSession[] });
        }
      } catch {
        if (!controller.signal.aborted) {
          setState({ status: "error" });
        }
      }
    };

    void fetchSessions();
    return () => controller.abort();
  }, [attempt]);

  if (state.status === "loading") {
    return (
      <Typography color="text.secondary">{t.home.loadingSessions}</Typography>
    );
  }

  if (state.status === "unauthorized") {
    return (
      <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          {t.teacherClasses.unauthorized}
        </Alert>
        <Button
          href="/login"
          variant="contained"
          startIcon={<LoginOutlinedIcon />}
          sx={{
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 800,
            px: 2.5,
          }}
        >
          {t.auth.loginButton}
        </Button>
      </Stack>
    );
  }

  if (state.status === "error") {
    return (
      <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {t.errors.unknown}
        </Alert>
        <Button
          variant="contained"
          onClick={() => {
            setState({ status: "loading" });
            setAttempt((current) => current + 1);
          }}
          sx={{
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 800,
            px: 2.5,
          }}
        >
          {t.teacherClasses.retry}
        </Button>
      </Stack>
    );
  }

  return (
    <BookingSessionList
      sessions={state.sessions}
      emptyMessage={t.home.emptySessions}
    />
  );
}
