import { Resend } from "resend";

type EmailProvider = "console" | "resend";

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

type BookingEmailTemplateInput = {
  studentName: string;
  heading: string;
  introText: string;
  statusLabel: string;
  statusTone: "success" | "neutral";
  sessionTitle: string;
  sessionDate: string;
  slotStartTime: string;
  slotEndTime: string;
  footerText: string;
  actionUrl?: string;
  actionLabel?: string;
};

const getEmailProvider = (): EmailProvider => {
  const emailProvider = process.env.EMAIL_PROVIDER;

  if (emailProvider === "console" || emailProvider === "resend") {
    return emailProvider;
  }

  console.warn(
    `Unknown EMAIL_PROVIDER "${emailProvider}". Falling back to "console".`,
  );

  return "console";
};

const getAppUrl = () => {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
};

const sendConsoleEmail = async ({ to, subject, text, html }: EmailMessage) => {
  console.log("");
  console.log("====================================");
  console.log("📧 DEV EMAIL");
  console.log("====================================");
  console.log(`Provider: console`);
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

const sendResendEmail = async ({ to, subject, text, html }: EmailMessage) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey) {
    console.warn("RESEND_API_KEY saknas. Mailet loggas i terminalen istället.");

    await sendConsoleEmail({
      to,
      subject,
      text,
      html,
    });

    return;
  }

  if (!from) {
    console.warn("EMAIL_FROM saknas. Mailet loggas i terminalen istället.");

    await sendConsoleEmail({
      to,
      subject,
      text,
      html,
    });

    return;
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("Kunde inte skicka mail med Resend:", error);
    throw new Error("Kunde inte skicka mail med Resend.");
  }
};

const sendEmail = async (message: EmailMessage) => {
  const emailProvider = getEmailProvider();

  if (emailProvider === "console") {
    await sendConsoleEmail(message);
    return;
  }

  if (emailProvider === "resend") {
    await sendResendEmail(message);
    return;
  }
};

const createBookingDetailsText = ({
  sessionTitle,
  sessionDate,
  slotStartTime,
  slotEndTime,
}: Pick<
  BookingEmailTemplateInput,
  "sessionTitle" | "sessionDate" | "slotStartTime" | "slotEndTime"
>) => {
  return `
Tillfälle: ${sessionTitle}
Datum: ${sessionDate}
Tid: ${slotStartTime}–${slotEndTime}
`.trim();
};

const createEmailLayout = ({
  studentName,
  heading,
  introText,
  statusLabel,
  statusTone,
  sessionTitle,
  sessionDate,
  slotStartTime,
  slotEndTime,
  footerText,
  actionUrl,
  actionLabel,
}: BookingEmailTemplateInput) => {
  const statusColor = statusTone === "success" ? "#15803d" : "#475569";
  const statusBackground = statusTone === "success" ? "#dcfce7" : "#e2e8f0";

  const actionButtonHtml =
    actionUrl && actionLabel
      ? `
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 0;">
                  <tr>
                    <td>
                      <a href="${actionUrl}" style="display:inline-block; padding:13px 20px; border-radius:999px; background-color:#1976d2; color:#ffffff; text-decoration:none; font-size:14px; font-weight:700;">
                        ${actionLabel}
                      </a>
                    </td>
                  </tr>
                </table>
`
      : "";

  return `
<!DOCTYPE html>
<html lang="sv">
  <head>
    <meta charset="UTF-8" />
    <title>${heading}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif; color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f8; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; background-color:#ffffff; border-radius:20px; overflow:hidden; border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:28px 32px; background:linear-gradient(135deg, #1976d2, #4caf50); color:#ffffff;">
                <div style="font-size:14px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">
                  Bokningssystem
                </div>
                <h1 style="margin:12px 0 0; font-size:28px; line-height:1.2;">
                  ${heading}
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:32px;">
                <span style="display:inline-block; padding:8px 12px; border-radius:999px; font-size:13px; font-weight:700; color:${statusColor}; background-color:${statusBackground};">
                  ${statusLabel}
                </span>

                <p style="margin:24px 0 0; font-size:16px; line-height:1.6;">
                  Hej ${studentName}!
                </p>

                <p style="margin:12px 0 24px; font-size:16px; line-height:1.6; color:#374151;">
                  ${introText}
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb; border-radius:16px; overflow:hidden;">
                  <tr>
                    <td style="padding:14px 16px; background-color:#f9fafb; color:#6b7280; font-size:14px; width:35%;">
                      Tillfälle
                    </td>
                    <td style="padding:14px 16px; background-color:#f9fafb; font-size:14px; font-weight:700;">
                      ${sessionTitle}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:14px 16px; color:#6b7280; font-size:14px; width:35%; border-top:1px solid #e5e7eb;">
                      Datum
                    </td>
                    <td style="padding:14px 16px; font-size:14px; font-weight:700; border-top:1px solid #e5e7eb;">
                      ${sessionDate}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:14px 16px; background-color:#f9fafb; color:#6b7280; font-size:14px; width:35%; border-top:1px solid #e5e7eb;">
                      Tid
                    </td>
                    <td style="padding:14px 16px; background-color:#f9fafb; font-size:14px; font-weight:700; border-top:1px solid #e5e7eb;">
                      ${slotStartTime}–${slotEndTime}
                    </td>
                  </tr>
                </table>

                <p style="margin:24px 0 0; font-size:15px; line-height:1.6; color:#4b5563;">
                  ${footerText}
                </p>

${actionButtonHtml}
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px; background-color:#f9fafb; border-top:1px solid #e5e7eb;">
                <p style="margin:0; font-size:12px; line-height:1.6; color:#6b7280;">
                  Detta är ett automatiskt meddelande från Bokningssystem.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();
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
  const appUrl = getAppUrl();

  const bookingDetailsText = createBookingDetailsText({
    sessionTitle,
    sessionDate,
    slotStartTime,
    slotEndTime,
  });

  const text = `
Hej ${studentName}!

Din bokning är bekräftad.

${bookingDetailsText}

Du kan se och hantera din bokning i bokningssystemet:
${appUrl}
`.trim();

  const html = createEmailLayout({
    studentName,
    heading: "Din bokning är bekräftad",
    introText: "Din bokning är bekräftad.",
    statusLabel: "Bokad",
    statusTone: "success",
    sessionTitle,
    sessionDate,
    slotStartTime,
    slotEndTime,
    footerText: "Du kan se och hantera din bokning i bokningssystemet.",
    actionUrl: appUrl,
    actionLabel: "Öppna bokningssystemet",
  });

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
  const appUrl = getAppUrl();

  const bookingDetailsText = createBookingDetailsText({
    sessionTitle,
    sessionDate,
    slotStartTime,
    slotEndTime,
  });

  const text = `
Hej ${studentName}!

Din bokning har avbokats.

${bookingDetailsText}

Du kan boka en ny tid i bokningssystemet om du behöver:
${appUrl}
`.trim();

  const html = createEmailLayout({
    studentName,
    heading: "Din bokning har avbokats",
    introText: "Din bokning har avbokats.",
    statusLabel: "Avbokad",
    statusTone: "neutral",
    sessionTitle,
    sessionDate,
    slotStartTime,
    slotEndTime,
    footerText: "Du kan boka en ny tid i bokningssystemet om du behöver.",
    actionUrl: appUrl,
    actionLabel: "Öppna bokningssystemet",
  });

  await sendEmail({
    to,
    subject,
    text,
    html,
  });
};
