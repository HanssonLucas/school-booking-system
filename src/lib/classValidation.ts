import type { TeacherClassCardData } from "@/components/classes/TeacherClassCard";

export type SchoolClass = TeacherClassCardData & {
  designation: string | null;
  description: string | null;
};
export type ErrorKey =
  | "loadFailed"
  | "createFailed"
  | "invalidName"
  | "invalidDesignation"
  | "invalidDescription"
  | "unauthorized"
  | "forbidden"
  | "verificationRequired";

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNextSession = (
  value: unknown,
): value is NonNullable<SchoolClass["nextSession"]> =>
  isRecord(value) &&
  typeof value.id === "number" &&
  Number.isSafeInteger(value.id) &&
  value.id > 0 &&
  typeof value.title === "string" &&
  typeof value.date === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value.date) &&
  typeof value.startTime === "string" &&
  /^([01]\d|2[0-3]):[0-5]\d$/.test(value.startTime) &&
  typeof value.endTime === "string" &&
  /^([01]\d|2[0-3]):[0-5]\d$/.test(value.endTime);

export const isSchoolClass = (value: unknown): value is SchoolClass =>
  isRecord(value) &&
  typeof value.id === "number" &&
  Number.isSafeInteger(value.id) &&
  value.id > 0 &&
  typeof value.name === "string" &&
  (value.designation === null ||
    (typeof value.designation === "string" &&
      value.designation.length <= 40)) &&
  (value.description === null ||
    (typeof value.description === "string" &&
      value.description.length <= 500)) &&
  typeof value.studentCount === "number" &&
  Number.isSafeInteger(value.studentCount) &&
  value.studentCount >= 0 &&
  typeof value.upcomingSessionCount === "number" &&
  Number.isSafeInteger(value.upcomingSessionCount) &&
  value.upcomingSessionCount >= 0 &&
  (value.upcomingSessionCount === 0
    ? value.nextSession === null
    : isNextSession(value.nextSession));

export const getErrorKey = (body: unknown, fallback: ErrorKey): ErrorKey => {
  const code = isRecord(body) ? body.code : undefined;
  switch (code) {
    case "INVALID_CLASS_NAME":
      return "invalidName";
    case "INVALID_CLASS_DESIGNATION":
      return "invalidDesignation";
    case "INVALID_CLASS_DESCRIPTION":
      return "invalidDescription";
    case "UNAUTHORIZED":
      return "unauthorized";
    case "FORBIDDEN":
      return "forbidden";
    case "EMAIL_NOT_VERIFIED":
      return "verificationRequired";
    default:
      return fallback;
  }
};
