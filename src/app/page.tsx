"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import BookingSessionCard from "@/components/booking/BookingSessionCard";
import { mockBookingSessions } from "@/lib/mockBookingSessions";
type UserRole = "student" | "teacher" | null;

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(true);
  const router = useRouter();
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
            Bokningssystem
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Ett enkelt system där studenter kan boka tider för handledning och
            muntliga redovisningar.
          </Typography>

          {selectedRole && (
            <Typography sx={{ mt: 2 }} color="text.secondary">
              Vald vy: {selectedRole === "student" ? "Student" : "Lärare"}
            </Typography>
          )}
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Student
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Se tillgängliga bokningstillfällen, boka en plats och avboka vid
                behov.
              </Typography>
            </CardContent>

            <CardActions>
              <Button
                variant="contained"
                onClick={() => handleSelectRole("student")}
              >
                Gå till studentvy
              </Button>
            </CardActions>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Lärare
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Skapa nya bokningstillfällen för handledning eller muntliga
                redovisningar.
              </Typography>
            </CardContent>

            <CardActions>
              <Button
                variant="outlined"
                onClick={() => handleSelectRole("teacher")}
              >
                Gå till lärarvy
              </Button>
            </CardActions>
          </Card>
        </Stack>
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Kommande bokningstillfällen
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Här visas en översikt över tillgängliga tider. För att boka eller
            skapa tider behöver du välja student- eller lärarvy.
          </Typography>

          <Stack spacing={2}>
            {mockBookingSessions.map((session) => (
              <BookingSessionCard
                key={session.id}
                title={session.title}
                description={session.description}
                date={session.date}
                startTime={session.startTime}
                endTime={session.endTime}
                maxParticipants={session.maxParticipants}
                bookedParticipants={session.bookedParticipants}
              />
            ))}
          </Stack>
        </Box>
      </Container>
    </>
  );
}
