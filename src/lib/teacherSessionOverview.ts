import type { BookingSession } from "@/types/booking";

export type TeacherSession = BookingSession & { classId: number };
export type SessionClass = {
  id: number;
  name: string;
  designation: string | null;
};
export type SessionPeriod = "upcoming" | "past" | "all";
export type SessionSort = "dateAsc" | "dateDesc" | "bookedFirst";

// The application schedules sessions in Swedish local time. Comparing complete
// local timestamps avoids interpreting a school date in the browser's timezone.
export function getSchoolTime(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`;
}

export function getSessionStatus(session: TeacherSession, now: string) {
  if (`${session.date}T${session.endTime.slice(0, 5)}:00` <= now) return "past";
  if (`${session.date}T${session.startTime.slice(0, 5)}:00` <= now)
    return "ongoing";
  return "upcoming";
}

export function readSessionFilters(
  params: Pick<URLSearchParams, "get" | "getAll" | "has">,
) {
  const ids = params.getAll("classId");
  const raw = ids[0] ?? "";
  const classId =
    ids.length === 1 &&
    /^[1-9]\d*$/.test(raw) &&
    Number.isSafeInteger(Number(raw))
      ? Number(raw)
      : null;
  const period: SessionPeriod =
    params.get("period") === "past"
      ? "past"
      : params.get("period") === "all"
        ? "all"
        : "upcoming";
  const defaultSort: SessionSort = period === "past" ? "dateDesc" : "dateAsc";
  const value = params.get("sort");
  const sort: SessionSort =
    value === "dateAsc" || value === "dateDesc" || value === "bookedFirst"
      ? value
      : defaultSort;
  return {
    classId,
    hasClassFilter: params.has("classId"),
    period,
    sort,
    query: params.get("q") ?? "",
    onlyFull: params.get("onlyFull") === "1",
    onlyWithBookings: params.get("onlyWithBookings") === "1",
  };
}

export function filterTeacherSessions(
  sessions: TeacherSession[],
  classes: SessionClass[],
  filters: ReturnType<typeof readSessionFilters>,
  now: string,
) {
  const names = new Map(
    classes.map((item) => [item.id, `${item.name} ${item.designation ?? ""}`]),
  );
  const query = filters.query.trim().toLocaleLowerCase();
  return sessions
    .filter((session) => {
      const past = getSessionStatus(session, now) === "past";
      if (filters.hasClassFilter && session.classId !== filters.classId)
        return false;
      if (
        (filters.period === "past" && !past) ||
        (filters.period === "upcoming" && past)
      )
        return false;
      if (
        filters.onlyFull &&
        session.bookedParticipants < session.maxParticipants
      )
        return false;
      if (filters.onlyWithBookings && session.bookedParticipants === 0)
        return false;
      return (
        !query ||
        [
          session.title,
          session.description,
          session.date,
          session.startTime,
          session.endTime,
          names.get(session.classId),
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(query)
      );
    })
    .sort((a, b) => {
      const dateOrder =
        `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`) ||
        a.id - b.id;
      if (filters.sort === "bookedFirst")
        return b.bookedParticipants - a.bookedParticipants || dateOrder;
      return filters.sort === "dateDesc" ? -dateOrder : dateOrder;
    });
}

// A patch always starts from the live URL, preserving dialogs, anchors and
// changes from rapid consecutive interactions. null removes a filter.
export function patchSessionUrl(
  href: string,
  patch: Record<string, string | null>,
) {
  const url = new URL(href);
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === "") url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
