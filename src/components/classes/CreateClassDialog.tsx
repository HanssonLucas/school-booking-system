"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { useTranslations } from "@/i18n/useTranslations";
import ClassDialogHeader, {
  classButtonSx,
  classDialogPaperSx,
} from "./ClassDialogHeader";
import {
  getErrorKey,
  isRecord,
  isSchoolClass,
  type ErrorKey,
  type SchoolClass,
} from "@/lib/classValidation";

type CreateClassDialogProps = {
  onClose: () => void;
  onCreated: (schoolClass: SchoolClass) => void;
};

type CreatedClass = { schoolClass: SchoolClass; joinCode: string };

export default function CreateClassDialog({
  onClose,
  onCreated,
}: CreateClassDialogProps) {
  const { t } = useTranslations();
  const text = t.teacherClasses;
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const submitting = useRef(false);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [created, setCreated] = useState<CreatedClass | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const closeDialog = () => {
    if (submitting.current) return;
    onClose();
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current || created) return;
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 100) {
      setError("invalidName");
      return;
    }
    if (designation.trim().length > 40) {
      setError("invalidDesignation");
      return;
    }
    if (description.trim().length > 500) {
      setError("invalidDescription");
      return;
    }
    submitting.current = true;
    setIsCreating(true);
    setError(null);
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          designation: designation.trim() || null,
          description: description.trim() || null,
        }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        setError(getErrorKey(body, "createFailed"));
        return;
      }
      if (
        !isRecord(body) ||
        !isSchoolClass(body.schoolClass) ||
        typeof body.joinCode !== "string" ||
        !/^[A-F0-9]{16}$/.test(body.joinCode)
      ) {
        throw new Error("Invalid create class response");
      }
      const schoolClass = body.schoolClass;
      setCreated({ schoolClass, joinCode: body.joinCode });
      onCreated(schoolClass);
    } catch {
      setError("createFailed");
    } finally {
      submitting.current = false;
      setIsCreating(false);
    }
  };

  const copyCode = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.joinCode);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  return (
    <Dialog
      open
      maxWidth="sm"
      fullWidth
      aria-labelledby="create-class-heading"
      onClose={() => {
        if (!created) closeDialog();
      }}
      slotProps={{ paper: { sx: classDialogPaperSx } }}
    >
      <Box component="form" onSubmit={handleCreate}>
        <ClassDialogHeader
          id="create-class-heading"
          title={created ? text.created : text.create}
          description={text.description}
          icon={<SchoolOutlinedIcon />}
        />
        <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {error && (
              <Alert sx={{ borderRadius: 3 }} severity="error">
                {text[error]}
              </Alert>
            )}
            {created ? (
              <>
                <Typography sx={{ fontWeight: 750, overflowWrap: "anywhere" }}>
                  {created.schoolClass.name}
                </Typography>
                <Alert sx={{ borderRadius: 3 }} severity="info">
                  {text.codeNotice}
                </Alert>
                <TextField
                  label={text.codeLabel}
                  value={created.joinCode}
                  fullWidth
                  slotProps={{ input: { readOnly: true } }}
                  onFocus={(event) => event.target.select()}
                />
                <Button
                  variant="contained"
                  color="primary"
                  sx={classButtonSx}
                  startIcon={<ContentCopyOutlinedIcon />}
                  onClick={copyCode}
                >
                  {copyStatus === "copied" ? text.copied : text.copy}
                </Button>
                {copyStatus === "failed" && (
                  <Alert sx={{ borderRadius: 3 }} severity="warning">
                    {text.copyFailed}
                  </Alert>
                )}
              </>
            ) : (
              <>
                <TextField
                  autoFocus
                  label={text.nameLabel}
                  helperText={text.nameHelper}
                  value={name}
                  required
                  fullWidth
                  disabled={isCreating}
                  error={error === "invalidName"}
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError(null);
                  }}
                />
                <TextField
                  label={text.designationLabel}
                  placeholder="FE25-LINK"
                  helperText={text.designationHelper}
                  value={designation}
                  fullWidth
                  disabled={isCreating}
                  error={error === "invalidDesignation"}
                  slotProps={{ htmlInput: { maxLength: 40 } }}
                  onChange={(event) => {
                    setDesignation(event.target.value);
                    setError(null);
                  }}
                />
                <TextField
                  label={text.detailsDescriptionLabel}
                  helperText={`${text.detailsDescriptionHelper} ${description.length}/500`}
                  value={description}
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
                  disabled={isCreating}
                  error={error === "invalidDescription"}
                  slotProps={{ htmlInput: { maxLength: 500 } }}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    setError(null);
                  }}
                />
              </>
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
          {created ? (
            <Button
              variant="contained"
              color="primary"
              sx={classButtonSx}
              onClick={closeDialog}
            >
              {text.done}
            </Button>
          ) : (
            <>
              <Button
                color="primary"
                sx={classButtonSx}
                disabled={isCreating}
                onClick={closeDialog}
              >
                {text.cancel}
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={classButtonSx}
                startIcon={<AddRoundedIcon />}
                disabled={
                  isCreating ||
                  !name.trim() ||
                  name.trim().length > 100 ||
                  designation.trim().length > 40 ||
                  description.trim().length > 500
                }
              >
                {isCreating ? text.creating : text.create}
              </Button>
            </>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
}
