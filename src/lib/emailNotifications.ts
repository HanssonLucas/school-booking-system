import {
  sendBookingCancellationEmail,
  sendBookingConfirmationEmail,
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
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

type EmailVerificationNotificationInput = {
  to: string;
  userName: string;
  token: string;
  language: BookingLanguage;
};

type PasswordResetNotificationInput = {
  to: string;
  userName: string;
  token: string;
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

export const notifyEmailVerification = async (
  input: EmailVerificationNotificationInput,
) => {
  try {
    await sendEmailVerificationEmail(input);
  } catch (error) {
    console.error("Kunde inte skicka verifieringsmail:", error);
  }
};

export const notifyPasswordReset = async (
  input: PasswordResetNotificationInput,
) => {
  try {
    await sendPasswordResetEmail(input);
  } catch (error) {
    console.error("Kunde inte skicka lösenordsåterställningsmail:", error);
  }
};
