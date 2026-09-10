"use client";

import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
} from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import { useTranslations } from "@/i18n/useTranslations";
import ClassDialogHeader, {
  classButtonSx,
  classDialogPaperSx,
} from "./ClassDialogHeader";

type Props = {
  schoolClass: { id: number; name: string };
  onClose: () => void;
};
type ErrorKey =
  | "failed"
  | "notFound"
  | "unauthorized"
  | "forbidden"
  | "verificationRequired";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getErrorKey = (value: unknown): ErrorKey => {
  switch (isRecord(value) ? value.code : undefined) {
    case "CLASS_NOT_FOUND":
      return "notFound";
    case "UNAUTHORIZED":
      return "unauthorized";
    case "FORBIDDEN":
      return "forbidden";
    case "EMAIL_NOT_VERIFIED":
      return "verificationRequired";
    default:
      return "failed";
  }
};

export default function RegenerateClassCodeDialog({
  schoolClass,
  onClose,
}: Props) {
  const { t } = useTranslations();
  const text = t.regenerateClassCode;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const handleClose = () => {
    if (!submitting.current) onClose();
  };

  const handleRegenerate = async () => {
    if (submitting.current || joinCode || error) return;
    submitting.current = true;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/classes/${schoolClass.id}/join-code`, {
        method: "POST",
        cache: "no-store",
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
        typeof body.joinCode !== "string" ||
        !/^[A-F0-9]{16}$/.test(body.joinCode)
      ) {
        throw new Error("Invalid class code response");
      }
      setJoinCode(body.joinCode);
    } catch {
      setError("failed");
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  const copyCode = async () => {
    if (!joinCode) return;
    try {
      await navigator.clipboard.writeText(joinCode);
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
      aria-labelledby="regenerate-class-code-heading"
      onClose={() => {
        if (!joinCode) handleClose();
      }}
      slotProps={{ paper: { sx: classDialogPaperSx } }}
    >
      <ClassDialogHeader
        id="regenerate-class-code-heading"
        title={joinCode ? text.successTitle : text.title}
        description={schoolClass.name}
        icon={
          joinCode ? (
            <CheckCircleOutlineOutlinedIcon />
          ) : (
            <RefreshOutlinedIcon />
          )
        }
      />
      <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={3}>
          {joinCode ? (
            <>
              <Alert severity="success" sx={{ borderRadius: 3 }}>
                {text.success}
              </Alert>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: "background.default",
                }}
              >
                <Stack spacing={2}>
                  <TextField
                    label={t.teacherClasses.codeLabel}
                    value={joinCode}
                    fullWidth
                    slotProps={{
                      input: {
                        readOnly: true,
                        sx: { fontFamily: "monospace", fontWeight: 800 },
                      },
                    }}
                    onFocus={(event) => event.target.select()}
                  />
                  <Button
                    color="primary"
                    variant="contained"
                    sx={classButtonSx}
                    startIcon={<ContentCopyOutlinedIcon />}
                    onClick={copyCode}
                  >
                    {copyStatus === "copied"
                      ? t.teacherClasses.copied
                      : t.teacherClasses.copy}
                  </Button>
                </Stack>
              </Box>
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                {t.teacherClasses.codeNotice}
              </Alert>
              {copyStatus === "failed" && (
                <Alert severity="warning" sx={{ borderRadius: 3 }}>
                  {t.teacherClasses.copyFailed}
                </Alert>
              )}
            </>
          ) : (
            <Alert severity="warning" sx={{ borderRadius: 3 }}>
              {text.description}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {text[error]}
            </Alert>
          )}
          <DialogActions
            sx={{
              px: 0,
              pt: 1,
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={handleClose}
              disabled={isSubmitting}
              color="primary"
              sx={classButtonSx}
            >
              {joinCode
                ? t.teacherClasses.done
                : error
                  ? t.common.close
                  : t.teacherClasses.cancel}
            </Button>
            {!joinCode && !error && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleRegenerate}
                disabled={isSubmitting}
                startIcon={<RefreshOutlinedIcon />}
                sx={{ ...classButtonSx, px: 3, py: 1.1 }}
              >
                {isSubmitting ? text.submitting : text.confirm}
              </Button>
            )}
            {error === "verificationRequired" && (
              <Button
                href="/profile"
                variant="contained"
                color="primary"
                sx={classButtonSx}
                startIcon={<PersonOutlineOutlinedIcon />}
              >
                {t.profile.title}
              </Button>
            )}
            {error === "unauthorized" && (
              <Button
                href="/login"
                variant="contained"
                color="primary"
                sx={classButtonSx}
                startIcon={<LoginOutlinedIcon />}
              >
                {t.auth.loginButton}
              </Button>
            )}
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
