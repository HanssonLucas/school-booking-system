"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import ClassStudentsDialog from "@/components/classes/ClassStudentsDialog";
import ClassDialogHeader, {
  classButtonSx,
  classDialogPaperSx,
} from "./ClassDialogHeader";
import ClassesHelpDialog from "./ClassesHelpDialog";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import TeacherClassCard from "./TeacherClassCard";
import DeleteClassDialog from "./DeleteClassDialog";
import RenameClassDialog from "./RenameClassDialog";
import RegenerateClassCodeDialog from "./RegenerateClassCodeDialog";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { useTranslations } from "@/i18n/useTranslations";

type SchoolClass = { id: number; name: string; studentCount: number };
type ErrorKey =
  | "loadFailed"
  | "createFailed"
  | "invalidName"
  | "unauthorized"
  | "forbidden"
  | "verificationRequired";
type LoadState =
  | { status: "loading" }
  | { status: "error"; error: ErrorKey }
  | { status: "ready"; classes: SchoolClass[] };
type CreatedClass = { schoolClass: SchoolClass; joinCode: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isSchoolClass = (value: unknown): value is SchoolClass =>
  isRecord(value) &&
  typeof value.id === "number" &&
  Number.isSafeInteger(value.id) &&
  value.id > 0 &&
  typeof value.name === "string" &&
  typeof value.studentCount === "number" &&
  Number.isSafeInteger(value.studentCount) &&
  value.studentCount >= 0;

const getErrorKey = (body: unknown, fallback: ErrorKey): ErrorKey => {
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
    default:
      return fallback;
  }
};

export default function TeacherClassesSection() {
  const { t, language } = useTranslations();
  const text = t.teacherClasses;
  const numberFormat = new Intl.NumberFormat(language);
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [deleteClass, setDeleteClass] = useState<SchoolClass | null>(null);
  const [renameClass, setRenameClass] = useState<SchoolClass | null>(null);
  const [codeClass, setCodeClass] = useState<SchoolClass | null>(null);
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const submitting = useRef(false);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [created, setCreated] = useState<CreatedClass | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  useEffect(() => {
    const controller = new AbortController();
    const loadClasses = async () => {
      try {
        const response = await fetch("/api/classes", {
          cache: "no-store",
          signal: controller.signal,
        });
        const body: unknown = await response.json();
        if (controller.signal.aborted) return;
        if (!response.ok) {
          setLoadState({
            status: "error",
            error: getErrorKey(body, "loadFailed"),
          });
          return;
        }
        if (
          !isRecord(body) ||
          !Array.isArray(body.classes) ||
          !body.classes.every(isSchoolClass)
        ) {
          throw new Error("Invalid classes response");
        }
        setLoadState({ status: "ready", classes: body.classes });
      } catch {
        if (!controller.signal.aborted) {
          setLoadState({ status: "error", error: "loadFailed" });
        }
      }
    };
    void loadClasses();
    return () => controller.abort();
  }, [loadAttempt]);

  const openDialog = () => {
    setName("");
    setError(null);
    setCreated(null);
    setCopyStatus("idle");
    setIsOpen(true);
  };

  const closeDialog = () => {
    if (submitting.current) return;
    setIsOpen(false);
    setCreated(null);
    setCopyStatus("idle");
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current || created || loadState.status !== "ready") return;
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 100) {
      setError("invalidName");
      return;
    }
    submitting.current = true;
    setIsCreating(true);
    setError(null);
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
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
      setLoadState((current) =>
        current.status === "ready"
          ? { status: "ready", classes: [...current.classes, schoolClass] }
          : current,
      );
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

  const totalStudents =
    loadState.status === "ready"
      ? loadState.classes.reduce(
          (sum, schoolClass) => sum + schoolClass.studentCount,
          0,
        )
      : 0;

  return (
    <Box
      component="section"
      aria-labelledby="teacher-classes-heading"
      data-navigation-loading={
        loadState.status === "loading" ? "true" : "false"
      }
    >
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          borderRadius: 5,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          p: { xs: 3, md: 3.5 },
          mb: 3,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            zIndex: -1,
            bgcolor: "primary.main",
            opacity: 0.06,
            pointerEvents: "none",
          },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          sx={{
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ minWidth: 0, maxWidth: 680 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", mb: 1 }}
            >
              <SchoolOutlinedIcon fontSize="small" color="primary" />
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 800,
                  color: "primary.main",
                  letterSpacing: 1.2,
                }}
              >
                {t.common.teacher}
              </Typography>
            </Stack>
            <Typography
              id="teacher-classes-heading"
              component="h1"
              sx={{
                fontWeight: 900,
                letterSpacing: -0.8,
                lineHeight: 1.15,
                fontSize: { xs: "1.9rem", md: "2.35rem" },
                mb: 1,
              }}
            >
              {text.title}
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.65 }}>
              {text.overviewDescription}
            </Typography>
            {loadState.status === "ready" && (
              <Stack
                direction="row"
                spacing={2.5}
                useFlexGap
                sx={{ flexWrap: "wrap", mt: 2 }}
              >
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ alignItems: "center" }}
                >
                  <SchoolOutlinedIcon fontSize="small" color="primary" />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {numberFormat.format(loadState.classes.length)}{" "}
                    {loadState.classes.length === 1
                      ? text.classSingular
                      : text.classPlural}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ alignItems: "center" }}
                >
                  <GroupsOutlinedIcon fontSize="small" color="primary" />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {numberFormat.format(totalStudents)}{" "}
                    {totalStudents === 1
                      ? text.studentSingular
                      : text.studentPlural}
                  </Typography>
                </Stack>
              </Stack>
            )}
          </Box>
          <Stack
            spacing={1}
            sx={{
              flexShrink: 0,
              alignItems: { xs: "flex-start", md: "stretch" },
            }}
          >
            <Button
              color="primary"
              variant="contained"
              disableElevation
              startIcon={<AddRoundedIcon />}
              disabled={loadState.status !== "ready"}
              onClick={openDialog}
              sx={{
                ...classButtonSx,
                alignSelf: { xs: "flex-start", md: "center" },
                flexShrink: 0,
                minHeight: 46,
                px: 3,
              }}
            >
              {text.create}
            </Button>
            <Button
              variant="text"
              color="primary"
              startIcon={<HelpOutlineRoundedIcon />}
              onClick={() => setIsHelpOpen(true)}
              aria-haspopup="dialog"
              sx={{ ...classButtonSx, minHeight: 44 }}
            >
              {text.helpButton}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {isHelpOpen && <ClassesHelpDialog onClose={() => setIsHelpOpen(false)} />}

      <Box sx={{ minWidth: 0 }}>
        {loadState.status === "loading" && (
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
        {loadState.status === "error" && (
          <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
            <Alert sx={{ borderRadius: 3 }} severity="error">
              {text[loadState.error]}
            </Alert>
            {loadState.error === "verificationRequired" && (
              <Button
                color="primary"
                sx={classButtonSx}
                href="/profile"
                variant="outlined"
              >
                {t.profile.title}
              </Button>
            )}
            <Button
              color="primary"
              sx={classButtonSx}
              onClick={() => {
                setLoadState({ status: "loading" });
                setLoadAttempt((attempt) => attempt + 1);
              }}
            >
              {text.retry}
            </Button>
          </Stack>
        )}
        {loadState.status === "ready" &&
          (loadState.classes.length === 0 ? (
            <Typography color="text.secondary">{text.empty}</Typography>
          ) : (
            <Box
              component="ul"
              sx={{
                listStyle: "none",
                m: 0,
                p: 0,
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                gap: 3,
              }}
            >
              {[...loadState.classes]
                .sort(
                  (a, b) =>
                    a.name.localeCompare(b.name, language) || a.id - b.id,
                )
                .map((schoolClass) => (
                  <TeacherClassCard
                    key={schoolClass.id}
                    schoolClass={schoolClass}
                    onViewStudents={() => setSelectedClass(schoolClass)}
                    onRename={() => setRenameClass(schoolClass)}
                    onRegenerateCode={() => setCodeClass(schoolClass)}
                    onDelete={() => setDeleteClass(schoolClass)}
                  />
                ))}
            </Box>
          ))}

        {deleteClass && (
          <DeleteClassDialog
            key={deleteClass.id}
            schoolClass={deleteClass}
            onClose={() => setDeleteClass(null)}
            onDeleted={(classId) => {
              setLoadState((current) =>
                current.status === "ready"
                  ? {
                      status: "ready",
                      classes: current.classes.filter(
                        (item) => item.id !== classId,
                      ),
                    }
                  : current,
              );
              setDeleteClass(null);
            }}
          />
        )}

        {renameClass && (
          <RenameClassDialog
            key={renameClass.id}
            schoolClass={renameClass}
            onClose={() => setRenameClass(null)}
            onSaved={(updatedClass) => {
              setLoadState((current) =>
                current.status === "ready"
                  ? {
                      status: "ready",
                      classes: current.classes.map((item) =>
                        item.id === updatedClass.id
                          ? { ...item, name: updatedClass.name }
                          : item,
                      ),
                    }
                  : current,
              );
              setRenameClass(null);
            }}
          />
        )}

        {codeClass && (
          <RegenerateClassCodeDialog
            key={codeClass.id}
            schoolClass={codeClass}
            onClose={() => setCodeClass(null)}
          />
        )}

        {selectedClass && (
          <ClassStudentsDialog
            key={selectedClass.id}
            schoolClass={selectedClass}
            onClose={() => setSelectedClass(null)}
          />
        )}

        <Dialog
          open={isOpen}
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
                    <Typography
                      sx={{ fontWeight: 750, overflowWrap: "anywhere" }}
                    >
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
                    disabled={isCreating || !name.trim()}
                  >
                    {isCreating ? text.creating : text.create}
                  </Button>
                </>
              )}
            </DialogActions>
          </Box>
        </Dialog>
      </Box>
    </Box>
  );
}
