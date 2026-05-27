export type BookingSession = {
  id: number;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  bookedParticipants: number;
};

export type CreateBookingSessionInput = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
};

export type BookingWithSlotTime = {
  id: number;
  sessionId: number;
  studentName: string;
  studentEmail: string;
  createdAt: string;
  slotStartTime: string;
  slotEndTime: string;
};
