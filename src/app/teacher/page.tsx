import { Container, Typography } from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";

export default function TeacherPage() {
  return (
    <>
      <AppHeader />

      <Container sx={{ py: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Lärarvy
        </Typography>

        <Typography color="text.secondary">
          Här kommer lärare kunna skapa bokningstillfällen för handledning och
          muntliga redovisningar.
        </Typography>
      </Container>
    </>
  );
}
