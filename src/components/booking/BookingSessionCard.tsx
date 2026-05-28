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
import { useTranslations } from "@/i18n/useTranslations";

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
  showCancelButton?: boolean;
  onCancel?: () => void;
  showEditButton?: boolean;
  onEdit?: () => void;
  showViewBookingsButton?: boolean;
  onViewBookings?: () => void;
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
  showCancelButton = false,
  onCancel,
  showEditButton = false,
  onEdit,
  showViewBookingsButton = false,
  onViewBookings,
}: BookingSessionCardProps) {
  const { t } = useTranslations();

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
            <Chip label={t.bookingSession.slotDuration} />
            <Chip
              color={isFull ? "error" : "success"}
              label={
                isFull
                  ? t.bookingSession.full
                  : `${spotsLeft} ${t.bookingSession.of} ${maxParticipants} ${t.bookingSession.slotsLeft}`
              }
            />
          </Stack>
        </Stack>
      </CardContent>

      {(showBookingButton ||
        showCancelButton ||
        showEditButton ||
        showViewBookingsButton) && (
        <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
          {showBookingButton && (
            <Button variant="contained" disabled={isFull} onClick={onBook}>
              {isFull ? t.bookingSession.full : t.bookingSession.bookButton}
            </Button>
          )}

          {showCancelButton && (
            <Button
              variant="outlined"
              color="error"
              disabled={bookedParticipants === 0}
              onClick={onCancel}
            >
              {t.bookingSession.cancelButton}
            </Button>
          )}

          {showEditButton && (
            <Button variant="outlined" onClick={onEdit}>
              {t.bookingSession.editButton}
            </Button>
          )}
          {showViewBookingsButton && (
            <Button variant="outlined" onClick={onViewBookings}>
              {t.bookingSession.viewBookingsButton}
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
}
