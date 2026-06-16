type CalendarEventInput = {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
};

const removeIcsUnsafeCharacters = (value: string) => {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
};

const formatDateTimeForIcs = (date: string, time: string) => {
  return `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;
};

const formatCurrentDateTimeForIcs = () => {
  return new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

const createLocalDateTime = (date: string, time: string) => {
  return `${date}T${time}:00`;
};

const formatDateTimeForGoogleCalendar = (date: string, time: string) => {
  return `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;
};

export const createIcsFileContent = ({
  title,
  description = "",
  date,
  startTime,
  endTime,
}: CalendarEventInput) => {
  const safeTitle = removeIcsUnsafeCharacters(title);
  const safeDescription = removeIcsUnsafeCharacters(description);

  const startDateTime = formatDateTimeForIcs(date, startTime);
  const endDateTime = formatDateTimeForIcs(date, endTime);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bokningssystem//Booking Calendar Export//SV",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@bokningssystem.local`,
    `DTSTAMP:${formatCurrentDateTimeForIcs()}`,
    `DTSTART:${startDateTime}`,
    `DTEND:${endDateTime}`,
    `SUMMARY:${safeTitle}`,
    `DESCRIPTION:${safeDescription}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
};

export const downloadIcsFile = (fileName: string, calendarContent: string) => {
  const blob = new Blob([calendarContent], {
    type: "text/calendar;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};

export const createCalendarFileName = (title: string, date: string) => {
  const safeTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9åäö]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  return `${safeTitle || "bokning"}-${date}.ics`;
};

export const createGoogleCalendarUrl = ({
  title,
  description = "",
  date,
  startTime,
  endTime,
}: CalendarEventInput) => {
  const url = new URL("https://calendar.google.com/calendar/render");

  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", title);
  url.searchParams.set(
    "dates",
    `${formatDateTimeForGoogleCalendar(
      date,
      startTime,
    )}/${formatDateTimeForGoogleCalendar(date, endTime)}`,
  );
  url.searchParams.set("details", description);

  return url.toString();
};

export const createOutlookCalendarUrl = ({
  title,
  description = "",
  date,
  startTime,
  endTime,
}: CalendarEventInput) => {
  const url = new URL("https://outlook.live.com/calendar/0/deeplink/compose");

  url.searchParams.set("path", "/calendar/action/compose");
  url.searchParams.set("rru", "addevent");
  url.searchParams.set("subject", title);
  url.searchParams.set("body", description);
  url.searchParams.set("startdt", createLocalDateTime(date, startTime));
  url.searchParams.set("enddt", createLocalDateTime(date, endTime));

  return url.toString();
};

export const openCalendarUrl = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};
