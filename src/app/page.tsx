"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
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

      <Container sx={{ py: 6 }}>
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {t.home.title}
          </Typography>

          <Typography variant="body1" color="text.secondary">
            {t.home.description}
          </Typography>

          {selectedRole && (
            <Typography sx={{ mt: 2 }} color="text.secondary">
              {t.home.selectedView}{" "}
              {selectedRole === "student" ? t.common.student : t.common.teacher}
            </Typography>
          )}
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                {t.common.student}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {t.home.studentCardDescription}
              </Typography>
            </CardContent>

            <CardActions>
              <Button
                variant="contained"
                onClick={() => handleSelectRole("student")}
              >
                {t.home.goToStudentView}
              </Button>
            </CardActions>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                {t.common.teacher}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {t.home.teacherCardDescription}
              </Typography>
            </CardContent>

            <CardActions>
              <Button
                variant="outlined"
                onClick={() => handleSelectRole("teacher")}
              >
                {t.home.goToTeacherView}
              </Button>
            </CardActions>
          </Card>
        </Stack>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            {t.home.upcomingSessionsTitle}
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {t.home.upcomingSessionsDescription}
          </Typography>

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
        </Box>
      </Container>
    </>
  );
}
