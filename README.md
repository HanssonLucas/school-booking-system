# Booking System

A web-based booking system for school-related activities such as tutoring sessions, presentations and other scheduled appointments.

This project was originally built as my final school project, and I am now continuing development to make it more advanced, realistic and portfolio-ready.

> Status: This project is under active development.

## Purpose

The goal of this project is to provide a clearer and more structured alternative to shared documents or manual booking lists.

Teachers can create booking sessions, and students can book available time slots, cancel bookings and add booked times to their calendar.

## Tech Stack

- Next.js App Router
- TypeScript
- SQLite with better-sqlite3
- Material UI
- Resend for email delivery
- i18n support for Swedish and English
- Light and dark mode

## Current Features

- Student and teacher views
- Create booking sessions
- Book available time slots
- Cancel bookings
- View existing bookings by email
- Teacher overview of bookings
- Edit and delete booking sessions
- Variable slot duration
- Filtering and sorting for both student and teacher views
- Calendar export:
  - Google Calendar
  - Outlook Calendar
  - `.ics` file download

- Email notifications:
  - Booking confirmation
  - Cancellation confirmation
  - Console provider for local development
  - Resend provider for real email delivery

- Swedish and English translations
- Light and dark theme support

## Planned Features

- Authentication
- User roles for students and teachers
- Improved admin/teacher workflows
- More advanced filtering
- Better email templates
- Deployment
- Improved accessibility and UX polish

## Environment Variables

Create a `.env.local` file based on `.env.example`.

```env
EMAIL_PROVIDER=console
RESEND_API_KEY=
EMAIL_FROM="Bokningssystem <onboarding@resend.dev>"
```

Use `EMAIL_PROVIDER=console` for local development.

Use `EMAIL_PROVIDER=resend` when sending real emails through Resend.

## Getting Started

Install dependencies:

```bash
yarn install
```

Start the development server:

```bash
yarn dev
```

Open the app in your browser:

```txt
http://localhost:3000
```

## Notes

This project is still in active development. The current focus is to continue improving the project with more production-like features, cleaner architecture and a better user experience.
