export type Language = "sv" | "en";

export const translations = {
  sv: {
    common: {
      appName: "Bokningssystem",
      student: "Student",
      teacher: "Lärare",
      close: "Stäng",
    },
    home: {
      title: "Bokningssystem",
      description:
        "Ett enkelt system där studenter kan boka tider för handledning och muntliga redovisningar.",
    },
  },
  en: {
    common: {
      appName: "Booking system",
      student: "Student",
      teacher: "Teacher",
      close: "Close",
    },
    home: {
      title: "Booking system",
      description:
        "A simple system where students can book sessions for supervision and oral presentations.",
    },
  },
} as const;

export type Translations = typeof translations.sv;
