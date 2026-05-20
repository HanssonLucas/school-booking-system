import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function CreateBookingSessionForm() {
  return (
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
  );
}
