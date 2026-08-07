# Booking System

A web-based booking system for school-related activities such as tutoring sessions, presentations and other scheduled appointments.

This project was originally built as my final school project, where it received the highest grade. I am now continuing development to make it more advanced, realistic and portfolio-ready.

> Status: This project is under active development.

## Purpose

The goal of this project is to provide a clearer and more structured alternative to shared documents or manual booking lists.

Teachers can create and manage booking sessions, while students can log in, book available time slots, cancel their own bookings, receive email notifications and add booked times to their calendar.

## Tech Stack

- Next.js App Router
- TypeScript
- Next.js Route Handlers
- SQLite with better-sqlite3
- Material UI
- Resend for email delivery
- bcryptjs for password hashing
- Cookie-based authentication
- i18n support for Swedish and English
- Light and dark mode
- Yarn

## Current Features

- Student and teacher views
- Authentication:
  - Register and login
  - Hashed passwords
  - Cookie-based sessions
  - Logout

- User roles:
  - Student
  - Teacher

- Teacher signup code for creating teacher accounts
- Protected teacher page
- Protected teacher API routes
- Create booking sessions
- Edit and delete booking sessions
- Variable slot duration
- Book available time slots as an authenticated student
- Cancel own bookings as an authenticated student
- View own bookings as an authenticated student
- Teacher overview of bookings
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
  - Swedish and English email content

- Swedish and English translations
- Light and dark theme support

## Authentication and Authorization

The project includes a custom authentication system built with SQLite, hashed passwords and cookie-based sessions.

Students can register and book available time slots using their authenticated account.

Teachers can create, edit, delete and view bookings for sessions, but teacher functionality is protected both in the UI and in the backend API routes.

Teacher accounts require a signup code, configured through an environment variable. This prevents users from simply selecting the teacher role during registration without permission.

## Planned Features

- Improve authenticated student dashboard
- Improve teacher/admin workflows
- Better route-level loading and error states
- Deployment
- Improved accessibility
- UX polish
- Optional password reset flow
- Optional email verification

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

# Teacher signup
# Required when registering a teacher account.
# Do not use this example value in production.
TEACHER_SIGNUP_CODE=change-me
```

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

```bash
http://localhost:3000
```

## Notes

When using the console email provider, emails are logged in the terminal instead of being sent.

When using Resend, a valid `RESEND_API_KEY` is required. The default Resend test sender can be used during development, but for production-like usage a verified domain should be configured in Resend.

The local SQLite database file and local environment files should not be committed.
