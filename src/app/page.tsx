import { Button, Container, Typography } from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";

export default function HomePage() {
  return (
    <>
      <AppHeader />

      <Container sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Bokningssystem
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          Här ska studenter kunna boka tider för handledning och muntliga
          redovisningar.
        </Typography>

        <Button variant="contained">Testa MUI-knapp</Button>
      </Container>
    </>
  );
}
