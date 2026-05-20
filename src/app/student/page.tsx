import { Container, Typography } from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";

export default function StudentPage() {
  return (
    <>
      <AppHeader />

      <Container sx={{ py: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Studentvy
        </Typography>

        <Typography color="text.secondary">
          Här kommer studenter kunna se bokningstillfällen, boka platser och
          avboka sig.
        </Typography>
      </Container>
    </>
  );
}
