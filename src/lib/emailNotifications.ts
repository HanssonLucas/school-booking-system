import {
  sendBookingCancellationEmail,
  sendBookingConfirmationEmail,
} from "@/lib/email";
import type { BookingLanguage } from "@/types/booking";

type BookingEmailNotificationInput = {
  to: string;
  studentName: string;
  sessionTitle: string;
  sessionDate: string;
  slotStartTime: string;
  slotEndTime: string;
  language: BookingLanguage;
};

export const notifyBookingConfirmed = async (
  input: BookingEmailNotificationInput,
) => {
  try {
    await sendBookingConfirmationEmail(input);
  } catch (error) {
    console.error("Kunde inte skicka bekräftelsemail:", error);
  }
};

export const notifyBookingCancelled = async (
  input: BookingEmailNotificationInput,
) => {
  try {
    await sendBookingCancellationEmail(input);
  } catch (error) {
    console.error("Kunde inte skicka avbokningsmail:", error);
  }
};
