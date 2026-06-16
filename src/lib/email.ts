type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type BookingEmailInput = {
  to: string;
  studentName: string;
  sessionTitle: string;
  sessionDate: string;
  slotStartTime: string;
  slotEndTime: string;
};

const sendEmail = async ({ to, subject, text, html }: EmailMessage) => {
  console.log("");
  console.log("====================================");
  console.log("📧 DEV EMAIL");
  console.log("====================================");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log("");
  console.log("Text version:");
  console.log("------------------------------------");
  console.log(text);
  console.log("");
  console.log("HTML version:");
  console.log("------------------------------------");
  console.log(html);
  console.log("====================================");
  console.log("");
};

export const sendBookingConfirmationEmail = async ({
  to,
  studentName,
  sessionTitle,
  sessionDate,
  slotStartTime,
  slotEndTime,
}: BookingEmailInput) => {
  const subject = "Bekräftelse på din bokning";

  const text = `
Hej ${studentName}!

Din bokning är bekräftad.

Tillfälle: ${sessionTitle}
Datum: ${sessionDate}
Tid: ${slotStartTime}–${slotEndTime}

Du kan se och hantera din bokning i bokningssystemet.
`.trim();

  const html = `
<div>
  <h1>Din bokning är bekräftad</h1>

  <p>Hej ${studentName}!</p>

  <p>Din bokning är bekräftad.</p>

  <ul>
    <li><strong>Tillfälle:</strong> ${sessionTitle}</li>
    <li><strong>Datum:</strong> ${sessionDate}</li>
    <li><strong>Tid:</strong> ${slotStartTime}–${slotEndTime}</li>
  </ul>

  <p>Du kan se och hantera din bokning i bokningssystemet.</p>
</div>
`.trim();

  await sendEmail({
    to,
    subject,
    text,
    html,
  });
};

export const sendBookingCancellationEmail = async ({
  to,
  studentName,
  sessionTitle,
  sessionDate,
  slotStartTime,
  slotEndTime,
}: BookingEmailInput) => {
  const subject = "Bekräftelse på avbokning";

  const text = `
Hej ${studentName}!

Din bokning har avbokats.

Tillfälle: ${sessionTitle}
Datum: ${sessionDate}
Tid: ${slotStartTime}–${slotEndTime}

Du kan boka en ny tid i bokningssystemet om du behöver.
`.trim();

  const html = `
<div>
  <h1>Din bokning har avbokats</h1>

  <p>Hej ${studentName}!</p>

  <p>Din bokning har avbokats.</p>

  <ul>
    <li><strong>Tillfälle:</strong> ${sessionTitle}</li>
    <li><strong>Datum:</strong> ${sessionDate}</li>
    <li><strong>Tid:</strong> ${slotStartTime}–${slotEndTime}</li>
  </ul>

  <p>Du kan boka en ny tid i bokningssystemet om du behöver.</p>
</div>
`.trim();

  await sendEmail({
    to,
    subject,
    text,
    html,
  });
};
