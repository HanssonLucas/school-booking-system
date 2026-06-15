export const SLOT_LENGTH_MINUTES = 15;

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

export const getSlotTime = (startTime: string, bookingIndex: number) => {
  const sessionStartMinutes = timeToMinutes(startTime);

  const slotStartMinutes =
    sessionStartMinutes + bookingIndex * SLOT_LENGTH_MINUTES;

  const slotEndMinutes = slotStartMinutes + SLOT_LENGTH_MINUTES;

  return {
    slotStartTime: minutesToTime(slotStartMinutes),
    slotEndTime: minutesToTime(slotEndMinutes),
  };
};

export const getSlotCount = (startTime: string, endTime: string) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  const durationMinutes = endMinutes - startMinutes;

  return Math.floor(durationMinutes / SLOT_LENGTH_MINUTES);
};

export const getAllSlotTimes = (startTime: string, endTime: string) => {
  const slotCount = getSlotCount(startTime, endTime);

  return Array.from({ length: slotCount }, (_, index) =>
    getSlotTime(startTime, index),
  );
};
