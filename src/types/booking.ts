export type BookingLanguage = "sv" | "en";

export type BookingSession = {
  id: number;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  maxParticipants: number;
  bookedParticipants: number;
};

export type CreateBookingSessionInput = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
};

export type BookingWithSlotTime = {
  id: number;
  sessionId: number;
  studentName: string;
  studentEmail: string;
  createdAt: string;
  slotStartTime: string;
  slotEndTime: string;
  language: BookingLanguage;
};

export type StudentBookingLookup = {
  id: number;
  sessionId: number;
  studentName: string;
  studentEmail: string;
  createdAt: string;
  sessionTitle: string;
  sessionDate: string;
  sessionStartTime: string;
  sessionEndTime: string;
  slotStartTime: string;
  slotEndTime: string;
  language: BookingLanguage;
};
