import { TextField } from "@mui/material";
import TitleOutlinedIcon from "@mui/icons-material/TitleOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";

type SessionDetailsFieldsProps = {
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
}: SessionDetailsFieldsProps) {
  return (
    <>
      <TextField
        label={titleLabel}
        fullWidth
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        error={Boolean(titleError)}
        helperText={titleError}
        slotProps={{
          input: {
            startAdornment: (
              <TitleOutlinedIcon sx={{ mr: 1, color: "text.secondary" }} />
            ),
          },
        }}
        sx={textFieldSx}
      />

      <TextField
        label={descriptionLabel}
        fullWidth
        multiline
        minRows={3}
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        error={Boolean(descriptionError)}
        helperText={descriptionError}
        slotProps={{
          input: {
            startAdornment: (
              <NotesOutlinedIcon
                sx={{
                  mr: 1,
                  mt: 1,
                  color: "text.secondary",
                  alignSelf: "flex-start",
                }}
              />
            ),
          },
        }}
        sx={textFieldSx}
      />
    </>
  );
}
