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

export default function HomePage() {
  return (
    <>
      <AppHeader />

      <Container sx={{ py: 6 }}>
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Bokningssystem
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Ett enkelt system där studenter kan boka tider för handledning och
            muntliga redovisningar.
          </Typography>
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
              <Button variant="contained">Gå till studentvy</Button>
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
              <Button variant="outlined">Gå till lärarvy</Button>
            </CardActions>
          </Card>
        </Stack>
      </Container>
    </>
  );
}
