import { Stack } from "@mui/material";
import BookingSessionCard from "@/components/booking/BookingSessionCard";
import type { BookingSession } from "@/types/booking";

type BookingSessionListProps = {
  sessions: BookingSession[];
};

export default function BookingSessionList({
  sessions,
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
        />
      ))}
    </Stack>
  );
}
