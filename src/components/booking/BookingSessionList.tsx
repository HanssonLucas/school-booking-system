import { Paper, Stack, Typography } from "@mui/material";
import BookingSessionCard from "@/components/booking/BookingSessionCard";
import type { BookingSession } from "@/types/booking";

type BookingSessionListProps = {
  sessions: BookingSession[];
  showBookingButton?: boolean;
  onBookSession?: (sessionId: number) => void;
  showCancelButton?: boolean;
  onCancelSession?: (sessionId: number) => void;
  showEditButton?: boolean;
  onEditSession?: (sessionId: number) => void;
  emptyMessage?: string;
  showViewBookingsButton?: boolean;
  onViewBookingsSession?: (sessionId: number) => void;
  showDeleteButton?: boolean;
  onDeleteSession?: (sessionId: number) => void;
};

export default function BookingSessionList({
  sessions,
  showBookingButton = false,
  onBookSession,
  showCancelButton = false,
  onCancelSession,
  showEditButton = false,
  onEditSession,
  emptyMessage = "Det finns inga bokningstillfällen att visa.",
  showViewBookingsButton = false,
  onViewBookingsSession,
  showDeleteButton = false,
  onDeleteSession,
}: BookingSessionListProps) {
  if (sessions.length === 0) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Paper>
    );
  }
  return (
    <Stack spacing={2}>
      {sessions.map((session) => (
        <BookingSessionCard
          key={session.id}
          title={session.title}
          description={session.description}
          date={session.date}
          startTime={session.startTime}
          endTime={session.endTime}
          slotDurationMinutes={session.slotDurationMinutes}
          maxParticipants={session.maxParticipants}
          bookedParticipants={session.bookedParticipants}
          showBookingButton={showBookingButton}
          onBook={() => onBookSession?.(session.id)}
          showCancelButton={showCancelButton}
          onCancel={() => onCancelSession?.(session.id)}
          showEditButton={showEditButton}
          onEdit={() => onEditSession?.(session.id)}
          showViewBookingsButton={showViewBookingsButton}
          onViewBookings={() => onViewBookingsSession?.(session.id)}
          showDeleteButton={showDeleteButton}
          onDelete={() => onDeleteSession?.(session.id)}
        />
      ))}
    </Stack>
  );
}
