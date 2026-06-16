import {
  sendBookingCancellationEmail,
  sendBookingConfirmationEmail,
} from "@/lib/email";

type BookingEmailNotificationInput = {
  to: string;
  studentName: string;
  sessionTitle: string;
  sessionDate: string;
  slotStartTime: string;
  slotEndTime: string;
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
