# Booking System

A web-based booking system for school-related activities such as tutoring sessions, presentations and other scheduled appointments.

This project was originally built as my final school project, and I am now continuing development to make it more advanced, realistic and portfolio-ready.

> Status: This project is under active development.

## Purpose

The goal of this project is to provide a clearer and more structured alternative to shared documents or manual booking lists.

Teachers can create booking sessions, and students can book available time slots, cancel bookings, receive email notifications and add booked times to their calendar.

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
  - Non-blocking notification handling
  - Styled HTML email templates
  - App link button in emails
- Swedish and English translations
- Light and dark theme support

## Planned Features

- Authentication
- User roles for students and teachers
- Improved admin/teacher workflows
- More advanced filtering
- Deployment
- Improved accessibility and UX polish

## Environment Variables

Create a `.env.local` file based on `.env.example`.

```env
# Email provider
# Use "console" for local development.
# Use "resend" when sending real emails through Resend.
EMAIL_PROVIDER=console

# Required when EMAIL_PROVIDER=resend
RESEND_API_KEY=

# Sender address used for outgoing emails
EMAIL_FROM="Bokningssystem <onboarding@resend.dev>"

# App URL used in email links
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
