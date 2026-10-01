import { Alert, Box, MenuItem, TextField } from "@mui/material";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import { SLOT_DURATION_OPTIONS } from "@/lib/bookingSlots";
import { useTranslations } from "@/i18n/useTranslations";

type Props = {
  value: string;
  calculatedSlotCount: number;
  onChange: (value: string) => void;
};

export default function SessionSlotFields({
  value,
  calculatedSlotCount,
  onChange,
}: Props) {
  const { t } = useTranslations();

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

      <Alert
        severity={calculatedSlotCount > 0 ? "info" : "warning"}
        icon={<TimerOutlinedIcon />}
        sx={{ borderRadius: 3 }}
      >
        {t.createSessionForm.calculatedSlotsLabel}{" "}
        <Box component="span" sx={{ fontWeight: 900 }}>
          {calculatedSlotCount > 0 ? calculatedSlotCount : "-"}
        </Box>
      </Alert>
    </>
  );
}
