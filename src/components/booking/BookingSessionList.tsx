import { Stack } from "@mui/material";
import BookingSessionCard from "@/components/booking/BookingSessionCard";
import type { BookingSession } from "@/types/booking";

type BookingSessionListProps = {
  sessions: BookingSession[];
  showBookingButton?: boolean;
  onBookSession?: (sessionId: number) => void;
  showCancelButton?: boolean;
  onCancelSession?: (sessionId: number) => void;
};

export default function BookingSessionList({
  sessions,
  showBookingButton = false,
  onBookSession,
  showCancelButton = false,
  onCancelSession,
}: BookingSessionListProps) {
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
