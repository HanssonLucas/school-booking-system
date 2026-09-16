"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useTranslations } from "@/i18n/useTranslations";
import ClassDialogHeader, {
  classButtonSx,
  classDialogPaperSx,
} from "./ClassDialogHeader";

type SchoolClass = { id: number; name: string };
type RenameClassDialogProps = {
  schoolClass: SchoolClass;
  onClose: () => void;
  onSaved: (schoolClass: SchoolClass) => void;
};
type ErrorKey =
  | "invalidName"
  | "unauthorized"
  | "forbidden"
  | "verificationRequired"
  | "renameFailed"
  | "classNotFound";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getErrorKey = (body: unknown): ErrorKey => {
  const code = isRecord(body) ? body.code : undefined;
  switch (code) {
    case "INVALID_CLASS_NAME":
      return "invalidName";
    case "UNAUTHORIZED":
      return "unauthorized";
    case "FORBIDDEN":
      return "forbidden";
    case "EMAIL_NOT_VERIFIED":
      return "verificationRequired";
    case "CLASS_NOT_FOUND":
      return "classNotFound";
    default:
      return "renameFailed";
  }
};

export default function RenameClassDialog({
  schoolClass,
  onClose,
  onSaved,
}: RenameClassDialogProps) {
  const { t } = useTranslations();
  const text = t.teacherClasses;
  const [name, setName] = useState(schoolClass.name);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const submitting = useRef(false);
  const trimmedName = name.trim();
  const unchanged = trimmedName === schoolClass.name;

  const handleClose = () => {
    if (!submitting.current) onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    if (!trimmedName || trimmedName.length > 100) {
      setError("invalidName");
      return;
    }
    if (unchanged) return;
    submitting.current = true;
    setIsSaving(true);
    setError(null);
    let savedClass: SchoolClass | null = null;
    try {
      const response = await fetch(`/api/classes/${schoolClass.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        setError(getErrorKey(body));
        return;
      }
      if (
        !isRecord(body) ||
        !isRecord(body.schoolClass) ||
        body.schoolClass.id !== schoolClass.id ||
        typeof body.schoolClass.name !== "string" ||
        !body.schoolClass.name.trim() ||
        body.schoolClass.name.length > 100
      ) {
        throw new Error("Invalid rename class response");
      }
      savedClass = { id: schoolClass.id, name: body.schoolClass.name };
    } catch {
      setError("renameFailed");
    } finally {
      submitting.current = false;
      setIsSaving(false);
    }
    if (savedClass) onSaved(savedClass);
  };

  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      onClose={handleClose}
      aria-labelledby="rename-class-heading"
      slotProps={{ paper: { sx: classDialogPaperSx } }}
    >
      <Box component="form" onSubmit={handleSubmit} aria-busy={isSaving}>
        <ClassDialogHeader
          id="rename-class-heading"
          title={text.renameTitle}
          description={text.renameDescription}
          icon={<EditOutlinedIcon />}
        />
        <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 3 }}>
                {text[error]}
              </Alert>
            )}
            <TextField
              autoFocus
              required
              fullWidth
              label={text.nameLabel}
              helperText={text.nameHelper}
              value={name}
              disabled={isSaving}
              error={error === "invalidName"}
              slotProps={{ htmlInput: { maxLength: 100 } }}
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 3, sm: 4 },
            pb: { xs: 3, sm: 4 },
            pt: 0,
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Button
            color="primary"
            sx={classButtonSx}
            disabled={isSaving}
            onClick={handleClose}
          >
            {text.cancel}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={classButtonSx}
            disabled={
              isSaving || !trimmedName || trimmedName.length > 100 || unchanged
            }
            startIcon={
              isSaving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <EditOutlinedIcon />
              )
            }
          >
            {isSaving ? text.savingName : text.saveName}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
