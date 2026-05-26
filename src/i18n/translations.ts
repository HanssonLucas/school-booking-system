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
    onboarding: {
      welcome: "Välkommen",
      title: "Hur vill du använda systemet?",
      description:
        "Välj om du vill fortsätta som student eller lärare. Du kan också stänga detta och bara titta på översikten.",
      studentButton: "Jag är student",
      teacherButton: "Jag är lärare",
      closeAndViewOverview: "Stäng och visa översikt",
      closeDialog: "Stäng dialog",
    },
    student: {
      title: "Studentvy",
      description:
        "Här kan du se kommande bokningstillfällen, boka en plats och avboka dig vid behov.",
      loadingSessions: "Hämtar bokningstillfällen...",
      emptySessions: "Det finns inga bokningstillfällen att boka just nu.",
      bookingSuccess: "Din plats har bokats.",
      cancellationSuccess: "Din bokning har avbokats.",
      noSelectedSession: "Inget bokningstillfälle är valt.",
      bookingFallbackError: "Det gick inte att boka platsen.",
      cancellationFallbackError: "Det gick inte att avboka platsen.",
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
    onboarding: {
      welcome: "Welcome",
      title: "How do you want to use the system?",
      description:
        "Choose whether you want to continue as a student or teacher. You can also close this and just view the overview.",
      studentButton: "I am a student",
      teacherButton: "I am a teacher",
      closeAndViewOverview: "Close and view overview",
      closeDialog: "Close dialog",
    },
    student: {
      title: "Student view",
      description:
        "Here you can see upcoming booking sessions, book a place and cancel if needed.",
      loadingSessions: "Loading booking sessions...",
      emptySessions: "There are no booking sessions to book right now.",
      bookingSuccess: "Your place has been booked.",
      cancellationSuccess: "Your booking has been cancelled.",
      noSelectedSession: "No booking session is selected.",
      bookingFallbackError: "The place could not be booked.",
      cancellationFallbackError: "The booking could not be cancelled.",
    },
  },
} as const;

export type Translations = typeof translations.sv;
