import { Stack, TextField } from "@mui/material";

type DateTimeField = "date" | "startTime" | "endTime";

type Props = {
  values: Record<DateTimeField, string>;
  labels: Record<DateTimeField, string>;
  errors?: Partial<Record<DateTimeField, string>>;
  onChange: (field: DateTimeField, value: string) => void;
};

const fields: { name: DateTimeField; type: "date" | "time" }[] = [
  { name: "date", type: "date" },
  { name: "startTime", type: "time" },
  { name: "endTime", type: "time" },
];

export default function SessionDateTimeFields({
  values,
  labels,
  errors,
  onChange,
}: Props) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ alignItems: "flex-start" }}
    >
      {fields.map(({ name, type }) => (
        <TextField
          key={name}
          label={labels[name]}
          type={type}
          fullWidth
          value={values[name]}
          onChange={(event) => onChange(name, event.target.value)}
          error={Boolean(errors?.[name])}
          helperText={errors?.[name]}
          slotProps={{
            inputLabel: { shrink: true },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
            },
          }}
        />
      ))}
    </Stack>
  );
}
