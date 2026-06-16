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
  console.log("");
  console.log("====================================");
  console.log("📧 DEV EMAIL: Booking confirmation");
  console.log("====================================");
  console.log(`To: ${to}`);
  console.log(`Subject: Bekräftelse på din bokning`);
  console.log("");
  console.log(`Hej ${studentName}!`);
  console.log("");
  console.log("Din bokning är bekräftad.");
  console.log("");
  console.log(`Tillfälle: ${sessionTitle}`);
  console.log(`Datum: ${sessionDate}`);
  console.log(`Tid: ${slotStartTime}–${slotEndTime}`);
  console.log("");
  console.log("Du kan se och hantera din bokning i bokningssystemet.");
  console.log("====================================");
  console.log("");
};
