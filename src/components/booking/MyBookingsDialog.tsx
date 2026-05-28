"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import type { StudentBookingLookup } from "@/types/booking";
import { useTranslations } from "@/i18n/useTranslations";

type MyBookingsDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function MyBookingsDialog({
  open,
  onClose,
}: MyBookingsDialogProps) {
  const [studentEmail, setStudentEmail] = useState("");
  const [bookings, setBookings] = useState<StudentBookingLookup[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { t } = useTranslations();

  const handleClose = () => {
    setStudentEmail("");
    setBookings([]);
    setHasSearched(false);
    setErrorMessage("");
    onClose();
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!studentEmail.trim()) {
      setErrorMessage(t.myBookingsDialog.requiredError);
      return;
    }

    setIsSearching(true);
    setErrorMessage("");
    setHasSearched(false);

    try {
      const response = await fetch(
        `/api/bookings?studentEmail=${encodeURIComponent(studentEmail)}`,
      );

      if (!response.ok) {
        setErrorMessage(t.errors.unknown);
        return;
      }

      const data: StudentBookingLookup[] = await response.json();

      setBookings(data);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 5,
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
          },
        },
      }}
    >
      <Box
        sx={{
          p: { xs: 3, sm: 4 },
          pb: 2,
          background:
            "linear-gradient(135deg, rgba(25, 118, 210, 0.14), rgba(76, 175, 80, 0.08))",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 4,
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              boxShadow: 3,
              flexShrink: 0,
            }}
          >
            <SearchOutlinedIcon />
          </Box>

          <Box>
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 900, letterSpacing: -0.4 }}
            >
              {t.myBookingsDialog.title}
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {t.myBookingsDialog.description}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={3} component="form" onSubmit={handleSearch}>
          {errorMessage && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {errorMessage}
            </Alert>
          )}

          <TextField
            label={t.myBookingsDialog.emailLabel}
            type="email"
            fullWidth
            value={studentEmail}
            onChange={(event) => setStudentEmail(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <EmailOutlinedIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
            }}
          />

          <DialogActions
            sx={{
              px: 0,
              pt: 1,
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Button
              onClick={handleClose}
              disabled={isSearching}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                px: 2.5,
              }}
            >
              {t.myBookingsDialog.closeButton}
            </Button>

            <Button
              variant="contained"
              type="submit"
              disabled={isSearching}
              startIcon={<SearchOutlinedIcon />}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                px: 2.5,
              }}
            >
              {isSearching
                ? t.myBookingsDialog.searchingButton
                : t.myBookingsDialog.searchButton}
            </Button>
          </DialogActions>

          {hasSearched && bookings.length === 0 && (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              {t.myBookingsDialog.empty}
            </Alert>
          )}

          {bookings.length > 0 && (
            <Stack spacing={2}>
              {bookings.map((booking) => (
                <Paper
                  key={booking.id}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "background.default",
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 900, letterSpacing: -0.2 }}
                      >
                        {booking.sessionTitle}
                      </Typography>

                      <Chip
                        icon={<EventAvailableOutlinedIcon />}
                        label={`${booking.slotStartTime}–${booking.slotEndTime}`}
                        color="success"
                        sx={{
                          borderRadius: 999,
                          fontWeight: 800,
                        }}
                      />
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      sx={{
                        flexWrap: "wrap",
                      }}
                    >
                      <Chip
                        icon={<CalendarMonthOutlinedIcon />}
                        label={`${t.myBookingsDialog.date}: ${booking.sessionDate}`}
                        variant="outlined"
                        sx={{
                          borderRadius: 999,
                          bgcolor: "action.hover",
                        }}
                      />

                      <Chip
                        icon={<AccessTimeOutlinedIcon />}
                        label={`${t.myBookingsDialog.assignedTime}: ${booking.slotStartTime}–${booking.slotEndTime}`}
                        variant="outlined"
                        sx={{
                          borderRadius: 999,
                          bgcolor: "action.hover",
                        }}
                      />
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
