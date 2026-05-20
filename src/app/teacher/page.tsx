import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";

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

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Skapa bokningstillfälle
          </Typography>

          <Stack spacing={3} component="form">
            <TextField label="Titel" fullWidth />

            <TextField label="Beskrivning" fullWidth multiline minRows={3} />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Datum"
                type="date"
                fullWidth
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <TextField
                label="Starttid"
                type="time"
                fullWidth
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <TextField
                label="Sluttid"
                type="time"
                fullWidth
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Stack>

            <TextField label="Max antal deltagare" type="number" fullWidth />

            <Box>
              <Button variant="contained" type="submit">
                Skapa tillfälle
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
