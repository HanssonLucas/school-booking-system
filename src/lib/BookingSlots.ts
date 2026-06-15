export const DEFAULT_SLOT_DURATION_MINUTES = 15;

export const SLOT_DURATION_OPTIONS = [15, 20, 30, 45, 60];

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
};

export const getSlotTime = (
  startTime: string,
  bookingIndex: number,
  slotDurationMinutes = DEFAULT_SLOT_DURATION_MINUTES,
) => {
  const sessionStartMinutes = timeToMinutes(startTime);

  const slotStartMinutes =
    sessionStartMinutes + bookingIndex * slotDurationMinutes;

  const slotEndMinutes = slotStartMinutes + slotDurationMinutes;

  return {
    slotStartTime: minutesToTime(slotStartMinutes),
    slotEndTime: minutesToTime(slotEndMinutes),
  };
};

export const getSlotCount = (
  startTime: string,
  endTime: string,
  slotDurationMinutes = DEFAULT_SLOT_DURATION_MINUTES,
) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  const durationMinutes = endMinutes - startMinutes;

  return Math.floor(durationMinutes / slotDurationMinutes);
};

export const getAllSlotTimes = (
  startTime: string,
  endTime: string,
  slotDurationMinutes = DEFAULT_SLOT_DURATION_MINUTES,
) => {
  const slotCount = getSlotCount(startTime, endTime, slotDurationMinutes);

  return Array.from({ length: slotCount }, (_, index) =>
    getSlotTime(startTime, index, slotDurationMinutes),
  );
};
