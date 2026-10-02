import {
  Alert,
  Box,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import { SLOT_DURATION_OPTIONS } from "@/lib/bookingSlots";
import { useTranslations } from "@/i18n/useTranslations";

type Props = {
  value: string;
  startTime: string;
  endTime: string;
  calculatedSlotCount: number;
  onChange: (value: string) => void;
};

export default function SessionSlotFields({
  value,
  startTime,
  endTime,
  calculatedSlotCount,
  onChange,
}: Props) {
  const { t } = useTranslations();

  const hasTimes = Boolean(startTime && endTime);
  const hasSlots =
    Number.isSafeInteger(calculatedSlotCount) && calculatedSlotCount > 0;

  const slotLabel =
    calculatedSlotCount === 1
      ? t.bookingSession.slotsSingular
      : t.bookingSession.slotsPlural;

  return (
    <>
      <TextField
        select
        label={t.bookingSession.slotDuration}
        fullWidth
        value={value}
        onChange={(event) => onChange(event.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <TimerOutlinedIcon sx={{ mr: 1, color: "text.secondary" }} />
            ),
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
          },
        }}
      >
        {SLOT_DURATION_OPTIONS.map((duration) => (
          <MenuItem key={duration} value={String(duration)}>
            {duration} minuter
          </MenuItem>
        ))}
      </TextField>

      <Box role="status" aria-live="polite" aria-atomic="true">
        {hasTimes && !hasSlots ? (
          <Alert severity="warning" sx={{ borderRadius: 3 }}>
            {t.errors.invalidSessionTimeRange}
          </Alert>
        ) : (
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
              p: 2,
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
                bgcolor: hasSlots ? "primary.main" : "text.primary",
                opacity: hasSlots ? 0.07 : 0.025,
                pointerEvents: "none",
              },
            }}
          >
            <TimerOutlinedIcon
              sx={{
                color: hasSlots ? "primary.main" : "text.secondary",
                flexShrink: 0,
              }}
            />

            <Box sx={{ minWidth: 0 }}>
              {hasTimes && hasSlots ? (
                <>
                  <Typography sx={{ fontWeight: 800 }}>
                    {calculatedSlotCount} {slotLabel}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.25 }}
                  >
                    {value} {t.bookingSession.minutesPerBooking}
                    {" · "}
                    {startTime}–{endTime}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t.bookingSession.slotsPending}
                </Typography>
              )}
            </Box>
          </Stack>
        )}
      </Box>
    </>
  );
}
