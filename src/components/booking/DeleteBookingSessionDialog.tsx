"use client";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { useRouter } from "next/navigation";
import type { BookingSession } from "@/types/booking";
import { useAuth } from "@/components/auth/useAuth";
import { useTranslations } from "@/i18n/useTranslations";
import BookingDialogHeader from "@/components/booking/BookingDialogHeader";

type DeleteSessionSummary = Pick<
  BookingSession,
  "title" | "date" | "startTime" | "endTime"
>;

type DeleteBookingSessionDialogProps = {
  open: boolean;
  session?: DeleteSessionSummary | null;
  onClose: () => void;
  onConfirm: () => void;
};

const buttonSx = {
  minHeight: 44,
  borderRadius: 999,
  textTransform: "none",
  fontWeight: 700,
  px: 2.5,
} as const;

const cancelButtonSx = {
  ...buttonSx,
  color: "text.primary",
  borderColor: "divider",
  "&:hover": {
    borderColor: "text.secondary",
    bgcolor: "action.hover",
  },
} as const;

function parseSessionDate(value?: string): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T12:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return date;
}

export default function DeleteBookingSessionDialog({
  open,
  session,
  onClose,
  onConfirm,
}: DeleteBookingSessionDialogProps) {
  const { t, language } = useTranslations();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const isEmailUnverified = currentUser?.emailVerified === false;
  const locale = language === "sv" ? "sv-SE" : "en-GB";
  const sessionDate = parseSessionDate(session?.date);

  const monthLabel = sessionDate
    ? new Intl.DateTimeFormat(locale, {
        month: "short",
        timeZone: "UTC",
      }).format(sessionDate)
    : "";

  const dayLabel = sessionDate
    ? new Intl.DateTimeFormat(locale, {
        day: "numeric",
        timeZone: "UTC",
      }).format(sessionDate)
    : "";

  const dateLabel = sessionDate
    ? new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(sessionDate)
    : (session?.date ?? "");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-session-heading"
      aria-describedby="delete-session-description"
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            backgroundImage: "none",
            maxWidth: 600,
          },
        },
      }}
    >
      <BookingDialogHeader
        id="delete-session-heading"
        eyebrow={t.deleteSessionDialog.eyebrow}
        title={t.deleteSessionDialog.heading}
        onClose={onClose}
      />

      <DialogContent
        sx={{
          px: { xs: 3, sm: 4 },
          pt: 0,
          pb: 3,
        }}
      >
        {isEmailUnverified ? (
          <Alert
            id="delete-session-description"
            severity="warning"
            sx={{ borderRadius: 3 }}
          >
            {t.auth.teacherEmailVerificationRequired}
          </Alert>
        ) : (
          <Stack spacing={2.5}>
            {session && (
              <Box
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 3,
                  position: "relative",
                  isolation: "isolate",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    zIndex: -1,
                    bgcolor: "primary.main",
                    opacity: 0.035,
                    pointerEvents: "none",
                  },
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  {sessionDate && (
                    <Box
                      aria-hidden="true"
                      sx={{
                        width: { xs: 60, sm: 68 },
                        minHeight: 80,
                        py: 1.25,
                        flexShrink: 0,
                        borderRadius: 2.5,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "primary.main",
                        position: "relative",
                        isolation: "isolate",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          inset: 0,
                          zIndex: -1,
                          borderRadius: "inherit",
                          bgcolor: "primary.main",
                          opacity: 0.1,
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: 0.7,
                        }}
                      >
                        {monthLabel}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.25,
                          fontSize: "1.8rem",
                          fontWeight: 800,
                          lineHeight: 1.1,
                        }}
                      >
                        {dayLabel}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      component="h3"
                      sx={{
                        fontSize: { xs: "1.125rem", sm: "1.25rem" },
                        fontWeight: 700,
                        letterSpacing: -0.3,
                        lineHeight: 1.35,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {session.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.75, overflowWrap: "anywhere" }}
                    >
                      {dateLabel}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{
                        alignItems: "center",
                        mt: 0.5,
                        color: "text.secondary",
                      }}
                    >
                      <AccessTimeOutlinedIcon
                        sx={{ fontSize: 16, flexShrink: 0 }}
                      />

                      <Typography
                        variant="body2"
                        sx={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {session.startTime}–{session.endTime}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            )}

            <Typography
              id="delete-session-description"
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.7,
                overflowWrap: "anywhere",
              }}
            >
              {t.deleteSessionDialog.consequence}
            </Typography>
          </Stack>
        )}
      </DialogContent>

      <DialogActions
        disableSpacing
        sx={{
          px: { xs: 3, sm: 4 },
          pt: 0,
          pb: 3,
          gap: 1.5,
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        <Button
          type="button"
          variant="outlined"
          onClick={onClose}
          sx={cancelButtonSx}
        >
          {t.deleteSessionDialog.cancelButton}
        </Button>

        {isEmailUnverified ? (
          <Button
            type="button"
            variant="contained"
            disableElevation
            startIcon={<PersonOutlineOutlinedIcon />}
            onClick={() => router.push("/profile")}
            sx={buttonSx}
          >
            {t.profile.title}
          </Button>
        ) : (
          <Button
            type="button"
            color="error"
            variant="contained"
            disableElevation
            disabled={!session}
            onClick={onConfirm}
            startIcon={<DeleteOutlineOutlinedIcon />}
            sx={{
              ...buttonSx,
              bgcolor: "#B42318",
              color: "#FFFFFF",
              "&:hover": {
                bgcolor: "#912018",
              },
            }}
          >
            {t.deleteSessionDialog.confirmLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
