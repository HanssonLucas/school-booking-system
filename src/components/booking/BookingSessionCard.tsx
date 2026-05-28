import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
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
  showDeleteButton?: boolean;
  onDelete?: () => void;
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
  showDeleteButton = false,
  onDelete,
}: BookingSessionCardProps) {
  const { t } = useTranslations();

  const slotsLeft = maxParticipants - bookedParticipants;
  const isFull = slotsLeft === 0;

  const statusLabel = isFull
    ? t.bookingSession.full
    : `${slotsLeft} ${t.bookingSession.of} ${maxParticipants} ${t.bookingSession.slotsLeft}`;

  return (
    <Card
      sx={{
        borderRadius: 4,
        border: 1,
        borderColor: "divider",
        boxShadow: 2,
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: 6,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "flex-start" }}
            spacing={3}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                component="h2"
                sx={{ fontWeight: 700, mb: 0.5 }}
              >
                {title}
              </Typography>

              {description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    maxWidth: 720,
                    lineHeight: 1.6,
                  }}
                >
                  {description}
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "flex-start", sm: "flex-end" },
                minWidth: { sm: 190 },
              }}
            >
              <Chip
                icon={
                  isFull ? (
                    <EventBusyOutlinedIcon />
                  ) : (
                    <EventAvailableOutlinedIcon />
                  )
                }
                color={isFull ? "error" : "success"}
                label={statusLabel}
                sx={{
                  fontWeight: 700,
                  borderRadius: 999,
                  px: 0.75,
                  height: 34,
                  "& .MuiChip-icon": {
                    fontSize: 19,
                  },
                }}
              />
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap">
            <Chip
              icon={<CalendarMonthOutlinedIcon />}
              label={date}
              variant="outlined"
              sx={{
                borderRadius: 999,
                bgcolor: "action.hover",
              }}
            />

            <Chip
              icon={<AccessTimeOutlinedIcon />}
              label={`${startTime}–${endTime}`}
              variant="outlined"
              sx={{
                borderRadius: 999,
                bgcolor: "action.hover",
              }}
            />

            <Chip
              icon={<TimerOutlinedIcon />}
              label={t.bookingSession.slotDuration}
              variant="outlined"
              sx={{
                borderRadius: 999,
                bgcolor: "action.hover",
                borderColor: "divider",
                fontWeight: 500,
                height: 34,
                "& .MuiChip-icon": {
                  fontSize: 18,
                },
              }}
            />
          </Stack>
        </Stack>
      </CardContent>

      {(showBookingButton ||
        showCancelButton ||
        showEditButton ||
        showViewBookingsButton ||
        showDeleteButton) && (
        <>
          <Divider />

          <CardActions
            sx={{
              px: 3,
              py: 2,
              gap: 1,
              flexWrap: "wrap",
              justifyContent: {
                xs: "flex-start",
                sm: "flex-end",
              },
              bgcolor: "action.hover",
            }}
          >
            {showBookingButton && (
              <Button
                variant="contained"
                disabled={isFull}
                onClick={onBook}
                startIcon={
                  isFull ? (
                    <EventBusyOutlinedIcon />
                  ) : (
                    <EventAvailableOutlinedIcon />
                  )
                }
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                {isFull ? t.bookingSession.full : t.bookingSession.bookButton}
              </Button>
            )}

            {showCancelButton && (
              <Button
                variant="outlined"
                color="error"
                disabled={bookedParticipants === 0}
                onClick={onCancel}
                startIcon={<EventBusyOutlinedIcon />}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                {t.bookingSession.cancelButton}
              </Button>
            )}

            {showEditButton && (
              <Button
                variant="outlined"
                onClick={onEdit}
                startIcon={<EditOutlinedIcon />}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                {t.bookingSession.editButton}
              </Button>
            )}

            {showViewBookingsButton && (
              <Button
                variant="contained"
                onClick={onViewBookings}
                startIcon={<VisibilityOutlinedIcon />}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                {t.bookingSession.viewBookingsButton}
              </Button>
            )}

            {showDeleteButton && (
              <Button
                variant="outlined"
                color="error"
                onClick={onDelete}
                startIcon={<DeleteOutlineOutlinedIcon />}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                {t.bookingSession.deleteButton}
              </Button>
            )}
          </CardActions>
        </>
      )}
    </Card>
  );
}
