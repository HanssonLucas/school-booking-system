"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ClassOverviewDialog from "@/components/classes/ClassOverviewDialog";
import { classButtonSx } from "./ClassDialogHeader";
import ClassesHelpDialog from "./ClassesHelpDialog";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import TeacherClassCard from "./TeacherClassCard";
import DeleteClassDialog from "./DeleteClassDialog";
import RenameClassDialog from "./RenameClassDialog";
import RegenerateClassCodeDialog from "./RegenerateClassCodeDialog";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { useTranslations } from "@/i18n/useTranslations";
import CreateClassDialog from "./CreateClassDialog";
import {
  getErrorKey,
  isRecord,
  isSchoolClass,
  type ErrorKey,
  type SchoolClass,
} from "@/lib/classValidation";

type LoadState =
  | { status: "loading" }
  | { status: "error"; error: ErrorKey }
  | { status: "ready"; classes: SchoolClass[] };

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
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", flexShrink: 0 }}
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
            <Button
              variant="text"
              color="primary"
              startIcon={<HelpOutlineRoundedIcon />}
              onClick={() => setIsHelpOpen(true)}
              aria-haspopup="dialog"
              sx={{
                ...classButtonSx,
                minHeight: 44,
                fontWeight: 600,
                px: 1,
                minWidth: 0,
              }}
            >
              {text.helpButton}
            </Button>
          </Stack>
          <Box sx={{ minWidth: 0, maxWidth: 680 }}>
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
          </Box>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              {loadState.status === "ready" && (
                <Stack
                  direction="row"
                  spacing={2.5}
                  useFlexGap
                  sx={{ flexWrap: "wrap" }}
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
            <Button
              color="primary"
              variant="contained"
              disableElevation
              startIcon={<AddRoundedIcon />}
              disabled={loadState.status !== "ready"}
              onClick={() => setIsOpen(true)}
              sx={{
                ...classButtonSx,
                flexShrink: 0,
                minHeight: 46,
                px: 3,
              }}
            >
              {text.create}
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
                    onOpenClass={() => setSelectedClass(schoolClass)}
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
                          ? { ...item, ...updatedClass }
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
          <ClassOverviewDialog
            key={selectedClass.id}
            schoolClass={selectedClass}
            onClose={() => setSelectedClass(null)}
          />
        )}

        {isOpen && (
          <CreateClassDialog
            onClose={() => setIsOpen(false)}
            onCreated={(schoolClass) => {
              setLoadState((current) =>
                current.status === "ready"
                  ? {
                      status: "ready",
                      classes: [...current.classes, schoolClass],
                    }
                  : current,
              );
            }}
          />
        )}
      </Box>
    </Box>
  );
}
