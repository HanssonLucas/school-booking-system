"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AppHeader from "@/components/layout/AppHeader";
import RoleSelectionDialog from "@/components/onboarding/RoleSelectionDialog";
import BookingSessionList from "@/components/booking/BookingSessionList";
import { useTranslations } from "@/i18n/useTranslations";
import type { BookingSession } from "@/types/booking";

type UserRole = "student" | "teacher" | null;

export default function HomePage() {
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(true);

  const router = useRouter();
  const { t } = useTranslations();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/booking-sessions");

        if (!response.ok) {
          console.error("Kunde inte hämta bokningstillfällen");
          return;
        }

        const data: BookingSession[] = await response.json();
        setSessions(data);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleSelectRole = (role: "student" | "teacher") => {
    setSelectedRole(role);
    setIsRoleDialogOpen(false);
    router.push(`/${role}`);
  };

  const handleCloseRoleDialog = () => {
    setIsRoleDialogOpen(false);
  };

  return (
    <>
      <AppHeader />

      <RoleSelectionDialog
        open={isRoleDialogOpen}
        onClose={handleCloseRoleDialog}
        onSelectRole={handleSelectRole}
      />

      <Container sx={{ py: { xs: 4, md: 7 } }}>
        <Paper
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 6,
            p: { xs: 3, sm: 5, md: 7 },
            mb: 5,
            border: 1,
            borderColor: "divider",
            background:
              "linear-gradient(135deg, rgba(25, 118, 210, 0.14), rgba(156, 39, 176, 0.08))",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: 260,
              height: 260,
              borderRadius: "50%",
              bgcolor: "primary.main",
              opacity: 0.12,
              right: -80,
              top: -90,
            }}
          />

          <Box
            sx={{
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: "50%",
              bgcolor: "secondary.main",
              opacity: 0.1,
              right: 120,
              bottom: -90,
            }}
          />

          <Box sx={{ position: "relative", maxWidth: 760 }}>
            <Chip
              icon={<AccessTimeOutlinedIcon />}
              label={t.bookingSession.slotDuration}
              sx={{
                mb: 3,
                borderRadius: 999,
                fontWeight: 700,
                bgcolor: "background.paper",
              }}
            />

            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 900,
                letterSpacing: -1.5,
                lineHeight: 1.05,
                fontSize: { xs: "2.4rem", md: "4rem" },
                mb: 2,
              }}
            >
              {t.home.title}
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                lineHeight: 1.7,
                maxWidth: 680,
                mb: 4,
              }}
            >
              {t.home.description}
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => handleSelectRole("student")}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                  px: 3,
                  py: 1.3,
                }}
              >
                {t.home.goToStudentView}
              </Button>

              <Button
                variant="outlined"
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => handleSelectRole("teacher")}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                  px: 3,
                  py: 1.3,
                  bgcolor: "background.paper",
                }}
              >
                {t.home.goToTeacherView}
              </Button>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{
                flexWrap: "wrap",
                mt: 4,
              }}
            >
              <Chip
                icon={<AccessTimeOutlinedIcon />}
                label="15 min"
                variant="outlined"
                sx={{ borderRadius: 999, bgcolor: "background.paper" }}
              />
              <Chip
                icon={<TranslateOutlinedIcon />}
                label="SV / EN"
                variant="outlined"
                sx={{ borderRadius: 999, bgcolor: "background.paper" }}
              />
              <Chip
                icon={<DarkModeOutlinedIcon />}
                label="Light / Dark"
                variant="outlined"
                sx={{ borderRadius: 999, bgcolor: "background.paper" }}
              />
            </Stack>

            {selectedRole && (
              <Typography sx={{ mt: 3 }} color="text.secondary">
                {t.home.selectedView}{" "}
                {selectedRole === "student"
                  ? t.common.student
                  : t.common.teacher}
              </Typography>
            )}
          </Box>
        </Paper>

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

          {isLoading ? (
            <Typography color="text.secondary">
              {t.home.loadingSessions}
            </Typography>
          ) : (
            <BookingSessionList
              sessions={sessions}
              emptyMessage={t.home.emptySessions}
            />
          )}
        </Paper>
      </Container>
    </>
  );
}
