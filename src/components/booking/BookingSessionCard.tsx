import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";

type BookingSessionCardProps = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  bookedParticipants: number;
};

export default function BookingSessionCard({
  title,
  description,
  date,
  startTime,
  endTime,
  maxParticipants,
  bookedParticipants,
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
    </Card>
  );
}
