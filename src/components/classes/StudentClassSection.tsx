"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { useTranslations } from "@/i18n/useTranslations";

type SchoolClass = { id: number; name: string };
type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; schoolClass: SchoolClass | null };
type FeedbackKey =
  | "joined"
  | "invalidCode"
  | "rateLimited"
  | "alreadyInClass"
  | "unauthorized"
  | "forbidden"
  | "joinFailed";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isSchoolClass = (value: unknown): value is SchoolClass =>
  isRecord(value) &&
  typeof value.id === "number" &&
  Number.isSafeInteger(value.id) &&
  value.id > 0 &&
  typeof value.name === "string";

export default function StudentClassSection() {
  const { t } = useTranslations();
  const text = t.studentClass;
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const submitting = useRef(false);
  const [feedback, setFeedback] = useState<{
    severity: "success" | "error" | "info";
    key: FeedbackKey;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadClass = async () => {
      try {
        const response = await fetch("/api/classes/mine", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data: unknown = await response.json();
        if (
          !response.ok ||
          !isRecord(data) ||
          !(data.schoolClass === null || isSchoolClass(data.schoolClass))
        ) {
          throw new Error("Invalid class response");
        }
        if (!controller.signal.aborted) {
          setLoadState({ status: "ready", schoolClass: data.schoolClass });
        }
      } catch {
        if (!controller.signal.aborted) setLoadState({ status: "error" });
      }
    };
    void loadClass();
    return () => controller.abort();
  }, [loadAttempt]);

  const reloadClass = () => {
    setLoadState({ status: "loading" });
    setLoadAttempt((current) => current + 1);
  };

  const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      submitting.current ||
      loadState.status !== "ready" ||
      loadState.schoolClass !== null
    )
      return;

    setFeedback(null);
    const normalizedCode = code.trim().toUpperCase();
    if (!/^[A-F0-9]{16}$/.test(normalizedCode)) {
      setFeedback({ severity: "error", key: "invalidCode" });
      return;
    }

    submitting.current = true;
    setIsJoining(true);
    try {
      const response = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalizedCode }),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        const errorCode = isRecord(data) ? data.code : undefined;
        switch (errorCode) {
          case "INVALID_CLASS_CODE":
            setFeedback({ severity: "error", key: "invalidCode" });
            break;
          case "CLASS_JOIN_RATE_LIMITED":
            setFeedback({ severity: "error", key: "rateLimited" });
            break;
          case "ALREADY_IN_CLASS":
            setFeedback({ severity: "info", key: "alreadyInClass" });
            reloadClass();
            break;
          case "UNAUTHORIZED":
            setFeedback({ severity: "error", key: "unauthorized" });
            break;
          case "FORBIDDEN":
            setFeedback({ severity: "error", key: "forbidden" });
            break;
          default:
            setFeedback({ severity: "error", key: "joinFailed" });
        }
        return;
      }
      if (!isRecord(data) || !isSchoolClass(data.schoolClass)) {
        throw new Error("Invalid class join response");
      }
      setLoadState({ status: "ready", schoolClass: data.schoolClass });
      setCode("");
      setFeedback({ severity: "success", key: "joined" });
    } catch {
      setFeedback({ severity: "error", key: "joinFailed" });
    } finally {
      submitting.current = false;
      setIsJoining(false);
    }
  };

  return (
    <Paper
      component="section"
      aria-labelledby="student-class-heading"
      variant="outlined"
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 5,
        borderColor: "divider",
        boxShadow: 1,
      }}
    >
      <Stack spacing={3}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              bgcolor: "action.hover",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <SchoolOutlinedIcon />
          </Box>
          <Typography
            id="student-class-heading"
            variant="h5"
            component="h2"
            sx={{ fontWeight: 850, letterSpacing: -0.4 }}
          >
            {text.title}
          </Typography>
        </Stack>
        <Divider />
        {feedback && (
          <Alert severity={feedback.severity}>{text[feedback.key]}</Alert>
        )}
        {loadState.status === "loading" && (
          <Stack
            direction="row"
            spacing={1.5}
            role="status"
            sx={{ alignItems: "center" }}
          >
            <CircularProgress size={22} aria-hidden="true" />
            <Typography color="text.secondary">{text.loading}</Typography>
          </Stack>
        )}
        {loadState.status === "error" && (
          <Stack spacing={2}>
            <Alert severity="error">{text.loadFailed}</Alert>
            <Button onClick={reloadClass} sx={{ alignSelf: "flex-start" }}>
              {text.retry}
            </Button>
          </Stack>
        )}
        {loadState.status === "ready" &&
          (loadState.schoolClass ? (
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                {text.classLabel}
              </Typography>
              <Typography sx={{ fontWeight: 800, overflowWrap: "anywhere" }}>
                {loadState.schoolClass.name}
              </Typography>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleJoin}>
              <Stack spacing={2.5}>
                <Typography color="text.secondary">
                  {text.description}
                </Typography>
                <TextField
                  label={text.codeLabel}
                  helperText={text.codeHelper}
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value);
                    setFeedback(null);
                  }}
                  autoComplete="off"
                  disabled={isJoining}
                  error={feedback?.key === "invalidCode"}
                  slotProps={{
                    htmlInput: {
                      autoCapitalize: "characters",
                      spellCheck: false,
                    },
                  }}
                  fullWidth
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isJoining}
                  sx={{
                    alignSelf: { xs: "stretch", sm: "flex-start" },
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 800,
                    px: 3,
                    py: 1.1,
                  }}
                >
                  {isJoining ? text.joining : text.join}
                </Button>
              </Stack>
            </Box>
          ))}
      </Stack>
    </Paper>
  );
}
