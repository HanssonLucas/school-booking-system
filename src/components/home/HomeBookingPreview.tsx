"use client";

import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BookingSessionCard from "@/components/booking/BookingSessionCard";
import { useTranslations } from "@/i18n/useTranslations";

export default function HomeBookingPreview() {
  const { t } = useTranslations();
  const preview = t.home.preview;

  return (
    <Paper
      id="booking-preview"
      component="section"
      aria-labelledby="booking-preview-title"
      sx={{
        scrollMarginTop: 104,
        mt: 6,
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 5,
        border: 1,
        borderColor: "divider",
        boxShadow: 1,
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Chip
            icon={<VisibilityOutlinedIcon />}
            label={preview.notice}
            color="primary"
            variant="outlined"
            sx={{
              mb: 2,
              maxWidth: "100%",
              height: "auto",
              fontWeight: 700,
              "& .MuiChip-label": {
                whiteSpace: "normal",
                py: 0.75,
              },
            }}
          />

          <Typography
            id="booking-preview-title"
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 850,
              letterSpacing: -0.5,
              fontSize: { xs: "1.75rem", md: "2.125rem" },
            }}
            gutterBottom
          >
            {preview.title}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ maxWidth: 720, lineHeight: 1.7 }}
          >
            {preview.description}
          </Typography>
        </Box>

        <BookingSessionCard
          title={preview.supervisionTitle}
          description={preview.supervisionDescription}
          date="2026-10-05"
          startTime="09:00"
          endTime="10:00"
          slotDurationMinutes={15}
          maxParticipants={4}
          bookedParticipants={1}
        />

        <BookingSessionCard
          title={preview.presentationTitle}
          description={preview.presentationDescription}
          date="2026-10-07"
          startTime="13:00"
          endTime="15:00"
          slotDurationMinutes={30}
          maxParticipants={4}
          bookedParticipants={4}
        />
      </Stack>
    </Paper>
  );
}
