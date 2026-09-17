"use client";

import { useEffect, useId, useState } from "react";
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
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
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

export default function ClassOverviewDialog({ schoolClass, onClose }: Props) {
  const { t } = useTranslations();
  const text = t.classStudents;
  const overview = t.teacherClasses;
  const id = useId();
  const [tab, setTab] = useState(0);
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
      maxWidth="md"
      scroll="paper"
      aria-labelledby={`${id}-heading`}
      slotProps={{ paper: { sx: classDialogPaperSx } }}
    >
      <ClassDialogHeader
        id={`${id}-heading`}
        title={
          state.status === "ready" ? state.schoolClass.name : schoolClass.name
        }
        description={overview.classDialogDescription}
        icon={<GroupsOutlinedIcon />}
      />
      <Tabs
        value={tab}
        onChange={(_, value: number) => setTab(value)}
        aria-label={overview.classDialogTabs}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: "divider", flexShrink: 0 }}
      >
        <Tab
          id={`${id}-tab-0`}
          aria-controls={`${id}-panel-0`}
          label={overview.overviewTab}
          sx={{ textTransform: "none", minHeight: 48 }}
        />
        <Tab
          id={`${id}-tab-1`}
          aria-controls={`${id}-panel-1`}
          label={overview.studentsTab}
          sx={{ textTransform: "none", minHeight: 48 }}
        />
      </Tabs>
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
              <Typography>{overview.classDialogLoading}</Typography>
            </Stack>
          )}

          {state.status === "error" && (
            <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
              <Alert sx={{ borderRadius: 3 }} severity="error">
                {state.error === "loadFailed"
                  ? overview.classDialogLoadFailed
                  : text[state.error]}
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
              <Box
                role="tabpanel"
                id={`${id}-panel-0`}
                aria-labelledby={`${id}-tab-0`}
                hidden={tab !== 0}
                tabIndex={0}
              >
                <ClassSessionOverview
                  classId={classId}
                  studentCount={state.students.length}
                />
              </Box>
              <Box
                role="tabpanel"
                id={`${id}-panel-1`}
                aria-labelledby={`${id}-tab-1`}
                hidden={tab !== 1}
                tabIndex={0}
              >
                <Stack spacing={3}>
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
                </Stack>
              </Box>
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

type SessionSummary = {
  id: number;
  classId: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
};
type SessionState =
  | { status: "loading" }
  | { status: "error"; error: ErrorKey }
  | { status: "ready"; sessions: SessionSummary[] };

const isSessionSummary = (value: unknown): value is SessionSummary =>
  isRecord(value) &&
  typeof value.id === "number" &&
  Number.isSafeInteger(value.id) &&
  value.id > 0 &&
  typeof value.classId === "number" &&
  Number.isSafeInteger(value.classId) &&
  value.classId > 0 &&
  typeof value.title === "string" &&
  typeof value.date === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value.date) &&
  Number.isFinite(Date.parse(value.date + "T00:00:00Z")) &&
  typeof value.startTime === "string" &&
  /^([01]\d|2[0-3]):[0-5]\d$/.test(value.startTime) &&
  typeof value.endTime === "string" &&
  /^([01]\d|2[0-3]):[0-5]\d$/.test(value.endTime);

const schoolClock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Stockholm",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const getUpcomingSessions = (
  sessions: SessionSummary[],
  classId: number,
  now: Date,
): SessionSummary[] => {
  const parts = schoolClock.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)!.value;
  const localNow = `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")}:${part("second")}`;
  return sessions
    .filter(
      (session) =>
        session.classId === classId &&
        `${session.date} ${session.startTime}:00` >= localNow,
    )
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        a.startTime.localeCompare(b.startTime) ||
        a.id - b.id,
    );
};

function ClassSessionOverview({
  classId,
  studentCount,
}: {
  classId: number;
  studentCount: number;
}) {
  const { t, language } = useTranslations();
  const text = t.teacherClasses;
  const [state, setState] = useState<SessionState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch("/api/booking-sessions", {
          cache: "no-store",
          signal: controller.signal,
        });
        const body: unknown = await response.json();
        if (controller.signal.aborted) return;
        if (!response.ok) {
          setState({ status: "error", error: getErrorKey(body) });
          return;
        }
        if (!Array.isArray(body) || !body.every(isSessionSummary)) {
          throw new Error("Invalid session response");
        }
        setState({
          status: "ready",
          sessions: getUpcomingSessions(body, classId, new Date()),
        });
      } catch {
        if (!controller.signal.aborted) {
          setState({ status: "error", error: "loadFailed" });
        }
      }
    };
    void load();
    return () => controller.abort();
  }, [classId, attempt]);

  const numberFormat = new Intl.NumberFormat(language);
  const dateFormat = new Intl.DateTimeFormat(
    language === "sv" ? "sv-SE" : "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    },
  );

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <GroupsOutlinedIcon color="primary" />
        <Typography sx={{ fontWeight: 700 }}>
          {numberFormat.format(studentCount)}{" "}
          {studentCount === 1 ? text.studentSingular : text.studentPlural}
        </Typography>
      </Stack>
      <Typography component="h3" variant="h6" sx={{ fontWeight: 800 }}>
        {text.yourUpcomingSessions}
        {state.status === "ready" &&
          ` (${numberFormat.format(state.sessions.length)})`}
      </Typography>
      {state.status === "loading" && (
        <Stack
          direction="row"
          spacing={1.5}
          role="status"
          sx={{ alignItems: "center" }}
        >
          <CircularProgress size={22} />
          <Typography>{text.classSessionsLoading}</Typography>
        </Stack>
      )}
      {state.status === "error" && (
        <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {state.error === "loadFailed"
              ? text.classSessionsLoadFailed
              : t.classStudents[state.error]}
          </Alert>
          {state.error === "loadFailed" && (
            <Button
              sx={classButtonSx}
              variant="outlined"
              onClick={() => {
                setState({ status: "loading" });
                setAttempt((value) => value + 1);
              }}
            >
              {t.classStudents.retry}
            </Button>
          )}
          {state.error === "unauthorized" && (
            <Button sx={classButtonSx} href="/login">
              {t.classStudents.signIn}
            </Button>
          )}
          {state.error === "verificationRequired" && (
            <Button sx={classButtonSx} href="/profile">
              {t.profile.title}
            </Button>
          )}
        </Stack>
      )}
      {state.status === "ready" &&
        (state.sessions.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <CalendarMonthOutlinedIcon color="action" />
              <Typography color="text.secondary">
                {text.noUpcomingSessions}
              </Typography>
            </Stack>
          </Paper>
        ) : (
          <Stack
            component="ul"
            spacing={1.5}
            sx={{ listStyle: "none", m: 0, p: 0 }}
          >
            {state.sessions.map((session) => (
              <Paper
                component="li"
                variant="outlined"
                key={session.id}
                sx={{ p: 2.5, borderRadius: 3, bgcolor: "background.default" }}
              >
                <Typography sx={{ fontWeight: 800, overflowWrap: "anywhere" }}>
                  {session.title}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center", mt: 1 }}
                >
                  <CalendarMonthOutlinedIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    <time dateTime={session.date}>
                      {dateFormat.format(new Date(session.date + "T00:00:00Z"))}
                    </time>
                    {" · "}
                    {session.startTime}–{session.endTime}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        ))}
    </Stack>
  );
}
