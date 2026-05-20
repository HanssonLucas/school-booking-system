import { Box, Container, Typography } from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";
import CreateBookingSessionForm from "@/components/booking/CreateBookingSessionForm";

export default function TeacherPage() {
  return (
    <>
      <AppHeader />

      <Container sx={{ py: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Lärarvy
          </Typography>

          <Typography color="text.secondary">
            Här kan lärare skapa bokningstillfällen för handledning och muntliga
            redovisningar.
          </Typography>
        </Box>

        <CreateBookingSessionForm />
      </Container>
    </>
  );
}
