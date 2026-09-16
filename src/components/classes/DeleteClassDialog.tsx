"use client";

import { useRef, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useTranslations } from "@/i18n/useTranslations";
import ClassDialogHeader, {
  classButtonSx,
  classDialogPaperSx,
} from "./ClassDialogHeader";

type SchoolClass = { id: number; name: string };
type DeleteClassDialogProps = {
  schoolClass: SchoolClass;
  onClose: () => void;
  onDeleted: (classId: number) => void;
};
type ErrorKey =
  | "deleteFailed"
  | "classNotEmpty"
  | "classNotFound"
  | "unauthorized"
  | "forbidden"
  | "verificationRequired";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getErrorKey = (body: unknown): ErrorKey => {
  const code = isRecord(body) ? body.code : undefined;
  switch (code) {
    case "CLASS_NOT_EMPTY":
      return "classNotEmpty";
    case "CLASS_NOT_FOUND":
      return "classNotFound";
    case "UNAUTHORIZED":
      return "unauthorized";
    case "FORBIDDEN":
      return "forbidden";
    case "EMAIL_NOT_VERIFIED":
      return "verificationRequired";
    default:
      return "deleteFailed";
  }
};

export default function DeleteClassDialog({
  schoolClass,
  onClose,
  onDeleted,
}: DeleteClassDialogProps) {
  const { t } = useTranslations();
  const text = t.teacherClasses;
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);
  const submitting = useRef(false);

  const handleClose = () => {
    if (!submitting.current) onClose();
  };

  const handleDelete = async () => {
    if (submitting.current) return;
    submitting.current = true;
    setIsDeleting(true);
    setError(null);
    let deleted = false;
    try {
      const response = await fetch(`/api/classes/${schoolClass.id}`, {
        method: "DELETE",
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        setError(getErrorKey(body));
        return;
      }
      if (!isRecord(body) || body.deletedClassId !== schoolClass.id) {
        throw new Error("Invalid delete class response");
      }
      deleted = true;
    } catch {
      setError("deleteFailed");
    } finally {
      submitting.current = false;
      setIsDeleting(false);
    }
    if (deleted) onDeleted(schoolClass.id);
  };

  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      onClose={handleClose}
      aria-labelledby="delete-class-heading"
      aria-describedby="delete-class-notice"
      slotProps={{ paper: { sx: classDialogPaperSx } }}
    >
      <ClassDialogHeader
        id="delete-class-heading"
        title={text.deleteTitle}
        description={text.deleteDescription}
        icon={<DeleteOutlineOutlinedIcon color="error" />}
      />
      <DialogContent sx={{ p: { xs: 3, sm: 4 } }} aria-busy={isDeleting}>
        <Stack spacing={3}>
          <Typography sx={{ fontWeight: 800, overflowWrap: "anywhere" }}>
            {schoolClass.name}
          </Typography>
          <Alert
            id="delete-class-notice"
            severity="warning"
            sx={{ borderRadius: 3 }}
          >
            {text.deleteNotice}
          </Alert>
          {error && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {text[error]}
            </Alert>
          )}
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
          autoFocus
          color="primary"
          sx={classButtonSx}
          disabled={isDeleting}
          onClick={handleClose}
        >
          {text.cancel}
        </Button>
        <Button
          variant="contained"
          color="error"
          sx={classButtonSx}
          disabled={isDeleting}
          onClick={handleDelete}
          startIcon={
            isDeleting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <DeleteOutlineOutlinedIcon />
            )
          }
        >
          {isDeleting ? text.deleting : text.deleteClass}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
