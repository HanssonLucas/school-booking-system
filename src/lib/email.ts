type BookingConfirmationEmailInput = {
  to: string;
  studentName: string;
  sessionTitle: string;
  sessionDate: string;
  slotStartTime: string;
  slotEndTime: string;
};

export const sendBookingConfirmationEmail = async ({
  to,
  studentName,
  sessionTitle,
  sessionDate,
  slotStartTime,
  slotEndTime,
}: BookingConfirmationEmailInput) => {
  console.log("📧 Booking confirmation email");
  console.log("To:", to);
  console.log("Student:", studentName);
  console.log("Session:", sessionTitle);
  console.log("Date:", sessionDate);
  console.log("Time:", `${slotStartTime}–${slotEndTime}`);
};
