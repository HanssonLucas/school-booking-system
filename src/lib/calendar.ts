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
