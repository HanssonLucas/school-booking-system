import { Paper, Stack, Typography } from "@mui/material";
import BookingSessionCard from "@/components/booking/BookingSessionCard";
import type { BookingSession } from "@/types/booking";

type BookingSessionListProps = {
  sessions: BookingSession[];
  showBookingButton?: boolean;
  onBookSession?: (sessionId: number) => void;
  showCancelButton?: boolean;
  onCancelSession?: (sessionId: number) => void;
  emptyMessage?: string;
};

export default function BookingSessionList({
  sessions,
  showBookingButton = false,
  onBookSession,
  showCancelButton = false,
  onCancelSession,
  emptyMessage = "Det finns inga bokningstillfällen att visa.",
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
          maxParticipants={session.maxParticipants}
          bookedParticipants={session.bookedParticipants}
          showBookingButton={showBookingButton}
          onBook={() => onBookSession?.(session.id)}
          showCancelButton={showCancelButton}
          onCancel={() => onCancelSession?.(session.id)}
        />
      ))}
    </Stack>
  );
}
