"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ClassDialogHeader, {
  classButtonSx,
  classDialogPaperSx,
} from "./ClassDialogHeader";
import { useTranslations } from "@/i18n/useTranslations";

type SchoolClass = { id: number; name: string };
type Student = { id: number; name: string; email: string };
type ErrorKey =
  | "loadFailed"
  | "notFound"
  | "unauthorized"
  | "forbidden"
  | "verificationRequired";
type LoadState =
  | { status: "loading" }
  | { status: "error"; error: ErrorKey }
  | { status: "ready"; schoolClass: SchoolClass; students: Student[] };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStudent = (value: unknown): value is Student =>
  isRecord(value) &&
  typeof value.id === "number" &&
  Number.isSafeInteger(value.id) &&
  value.id > 0 &&
  typeof value.name === "string" &&
  typeof value.email === "string";

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
      return "loadFailed";
  }
};

type Props = {
  schoolClass: SchoolClass;
  onClose: () => void;
};

export default function ClassStudentsDialog({ schoolClass, onClose }: Props) {
  const { t } = useTranslations();
  const text = t.classStudents;
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [loadAttempt, setLoadAttempt] = useState(0);
  const classId = schoolClass.id;

  useEffect(() => {
    const controller = new AbortController();

    const loadStudents = async () => {
      try {
        const response = await fetch(`/api/classes/${classId}/students`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const body: unknown = await response.json();
        if (controller.signal.aborted) return;

        if (!response.ok) {
          setState({ status: "error", error: getErrorKey(body) });
          return;
        }

        if (
          !isRecord(body) ||
          !isRecord(body.schoolClass) ||
          body.schoolClass.id !== classId ||
          typeof body.schoolClass.name !== "string" ||
          !Array.isArray(body.students) ||
          !body.students.every(isStudent) ||
          body.studentCount !== body.students.length
        ) {
          throw new Error("Invalid class students response");
        }

        setState({
          status: "ready",
          schoolClass: { id: classId, name: body.schoolClass.name },
          students: body.students,
        });
      } catch {
        if (!controller.signal.aborted) {
          setState({ status: "error", error: "loadFailed" });
        }
      }
    };

    void loadStudents();
    return () => controller.abort();
  }, [classId, loadAttempt]);

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="class-students-heading"
      slotProps={{ paper: { sx: classDialogPaperSx } }}
    >
      <ClassDialogHeader
        id="class-students-heading"
        title={text.title}
        description={
          state.status === "ready" ? state.schoolClass.name : schoolClass.name
        }
        icon={<GroupsOutlinedIcon />}
      />
      <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={3}>
          {state.status === "loading" && (
            <Stack
              direction="row"
              spacing={1.5}
              role="status"
              sx={{ alignItems: "center" }}
            >
              <CircularProgress size={22} />
              <Typography>{text.loading}</Typography>
            </Stack>
          )}

          {state.status === "error" && (
            <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
              <Alert sx={{ borderRadius: 3 }} severity="error">
                {text[state.error]}
              </Alert>
              {state.error === "verificationRequired" && (
                <Button
                  color="primary"
                  sx={classButtonSx}
                  href="/profile"
                  variant="outlined"
                >
                  {t.profile.title}
                </Button>
              )}
              {state.error === "unauthorized" && (
                <Button
                  color="primary"
                  sx={classButtonSx}
                  href="/login"
                  variant="outlined"
                >
                  {text.signIn}
                </Button>
              )}
              {state.error === "loadFailed" && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={classButtonSx}
                  onClick={() => {
                    setState({ status: "loading" });
                    setLoadAttempt((attempt) => attempt + 1);
                  }}
                >
                  {text.retry}
                </Button>
              )}
            </Stack>
          )}

          {state.status === "ready" && (
            <>
              <Alert
                severity="info"
                icon={<GroupsOutlinedIcon />}
                sx={{ borderRadius: 3 }}
              >
                {text.countLabel}:{" "}
                <Box component="span" sx={{ fontWeight: 900 }}>
                  {state.students.length}
                </Box>
              </Alert>
              {state.students.length === 0 ? (
                <Alert sx={{ borderRadius: 3 }} severity="info">
                  {text.empty}
                </Alert>
              ) : (
                <Stack
                  component="ul"
                  spacing={1.5}
                  sx={{ listStyle: "none", m: 0, p: 0 }}
                >
                  {state.students.map((student) => (
                    <Paper
                      component="li"
                      elevation={0}
                      key={student.id}
                      sx={{
                        p: 2.25,
                        borderRadius: 4,
                        border: 1,
                        borderColor: "divider",
                        bgcolor: "background.default",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: "center" }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                          }}
                        >
                          <PersonOutlineOutlinedIcon />
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontWeight: 900,
                              letterSpacing: -0.2,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {student.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.25, overflowWrap: "anywhere" }}
                          >
                            {student.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{ px: { xs: 3, sm: 4 }, pb: 3, pt: 0, gap: 1, flexWrap: "wrap" }}
      >
        <Button color="primary" onClick={onClose} sx={classButtonSx}>
          {t.common.close}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
