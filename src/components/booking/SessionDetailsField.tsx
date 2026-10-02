import { TextField } from "@mui/material";
import { useTranslations } from "@/i18n/useTranslations";

type Props = {
  title: string;
  description: string;
  titleLabel: string;
  descriptionLabel: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  titleError?: string;
  descriptionError?: string;
};

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
  },
};

export default function SessionDetailsFields({
  title,
  description,
  titleLabel,
  descriptionLabel,
  onTitleChange,
  onDescriptionChange,
  titleError,
  descriptionError,
}: Props) {
  const { t } = useTranslations();

  return (
    <>
      <TextField
        label={titleLabel}
        placeholder={t.bookingSession.titlePlaceholder}
        fullWidth
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        error={Boolean(titleError)}
        helperText={titleError}
        slotProps={{
          inputLabel: { shrink: true },
        }}
        sx={textFieldSx}
      />

      <TextField
        label={`${descriptionLabel} (${t.bookingSession.optionalLabel})`}
        placeholder={t.bookingSession.descriptionPlaceholder}
        fullWidth
        multiline
        minRows={3}
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        error={Boolean(descriptionError)}
        helperText={descriptionError}
        slotProps={{
          inputLabel: { shrink: true },
        }}
        sx={textFieldSx}
      />
    </>
  );
}
