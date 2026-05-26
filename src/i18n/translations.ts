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
      selectedView: "Vald vy:",
      studentCardDescription:
        "Se tillgängliga bokningstillfällen, boka en plats och avboka vid behov.",
      teacherCardDescription:
        "Skapa nya bokningstillfällen för handledning eller muntliga redovisningar.",
      goToStudentView: "Gå till studentvy",
      goToTeacherView: "Gå till lärarvy",
      upcomingSessionsTitle: "Kommande bokningstillfällen",
      upcomingSessionsDescription:
        "Här visas en översikt över tillgängliga tider. För att boka eller skapa tider behöver du välja student- eller lärarvy.",
      loadingSessions: "Hämtar bokningstillfällen...",
      emptySessions: "Det finns inga bokningstillfällen att visa just nu.",
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
      selectedView: "Selected view:",
      studentCardDescription:
        "View available booking sessions, book a place and cancel if needed.",
      teacherCardDescription:
        "Create new booking sessions for supervision or oral presentations.",
      goToStudentView: "Go to student view",
      goToTeacherView: "Go to teacher view",
      upcomingSessionsTitle: "Upcoming booking sessions",
      upcomingSessionsDescription:
        "Here you can see an overview of available sessions. To book or create sessions, choose the student or teacher view.",
      loadingSessions: "Loading booking sessions...",
      emptySessions: "There are no booking sessions to show right now.",
    },
  },
} as const;

export type Translations = typeof translations.sv;
