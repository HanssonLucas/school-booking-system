import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

type BookingSessionCardProps = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  bookedParticipants: number;
  showBookingButton?: boolean;
  onBook?: () => void;
};

export default function BookingSessionCard({
  title,
  description,
  date,
  startTime,
  endTime,
  maxParticipants,
  bookedParticipants,
  showBookingButton = false,
  onBook,
}: BookingSessionCardProps) {
  const spotsLeft = maxParticipants - bookedParticipants;
  const isFull = spotsLeft === 0;

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" component="h2">
              {title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Chip label={date} />
            <Chip label={`${startTime}–${endTime}`} />
            <Chip
              color={isFull ? "error" : "success"}
              label={
                isFull
                  ? "Fullbokad"
                  : `${spotsLeft} av ${maxParticipants} platser kvar`
              }
            />
          </Stack>
        </Stack>
      </CardContent>
      {showBookingButton && (
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button variant="contained" disabled={isFull} onClick={onBook}>
            {isFull ? "Fullbokad" : "Boka plats"}
          </Button>
        </CardActions>
      )}
    </Card>
  );
}
