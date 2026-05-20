import type { BookingSession } from "@/types/booking";

export const mockBookingSessions: BookingSession[] = [
  {
    id: 1,
    title: "Handledningen i React",
    description: "Ett tillfälle för frågor kring React, komponenter och state.",
    date: "2026-05-24",
    startTime: "10:00",
    endTime: "11:00",
    maxParticipants: 6,
    bookedParticipants: 3,
  },
  {
    id: 2,
    title: "Muntlig redovisning",
    description: "Boka en tid för muntlig redovisning av examensprojektet.",
    date: "2026-05-25",
    startTime: "13:00",
    endTime: "14:00",
    maxParticipants: 4,
    bookedParticipants: 4,
  },
];
