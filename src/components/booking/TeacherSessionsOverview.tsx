"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  InputAdornment,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { useTranslations } from "@/i18n/useTranslations";
import {
  filterTeacherSessions,
  getSchoolTime,
  getSessionStatus,
  patchSessionUrl,
  readSessionFilters,
  type SessionClass,
  type SessionPeriod,
  type TeacherSession,
} from "@/lib/teacherSessionOverview";
import TeacherSessionCard from "./TeacherSessionCard";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import { alpha } from "@mui/material/styles";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ClassDialogHeader, {
  classDialogPaperSx,
} from "@/components/classes/ClassDialogHeader";

const buttonSx = {
  borderRadius: 999,
  textTransform: "none",
  fontWeight: 800,
  minHeight: 44,
  px: 2.5,
} as const;
type ClassesState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; classes: SessionClass[] };
const noClasses: SessionClass[] = [];

type Props = {
  sessions: TeacherSession[];
  isLoading: boolean;
  loadFailed: boolean;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (id: number) => void;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function TeacherSessionsOverview({
  sessions,
  isLoading,
  loadFailed,
  onRetry,
  onCreate,
  onEdit,
  onView,
  onDelete,
}: Props) {
  const { t, language } = useTranslations();
  const text = t.teacherSessionsOverview;
  const params = useSearchParams();
  const filters = readSessionFilters(params);
  const id = useId();
  const [now, setNow] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [menu, setMenu] = useState<{
    kind: "class" | "sort" | "filters";
    anchor: HTMLElement;
  } | null>(null);
  const [classesState, setClassesState] = useState<ClassesState>({
    status: "loading",
  });
  const [classAttempt, setClassAttempt] = useState(0);
  const classes =
    classesState.status === "ready" ? classesState.classes : noClasses;
  const classMap = useMemo(
    () => new Map(classes.map((item) => [item.id, item])),
    [classes],
  );

  useEffect(() => {
    const update = () => setNow(getSchoolTime());
    update();
    const timer = window.setInterval(update, 15000);
    window.addEventListener("focus", update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", update);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch("/api/classes", {
          cache: "no-store",
          signal: controller.signal,
        });
        const body: unknown = await response.json();
        if (
          !response.ok ||
          typeof body !== "object" ||
          body === null ||
          !("classes" in body) ||
          !Array.isArray(body.classes)
        )
          throw new Error("Invalid classes response");
        const list: SessionClass[] = body.classes.map((item: unknown) => {
          if (
            typeof item !== "object" ||
            item === null ||
            !("id" in item) ||
            typeof item.id !== "number" ||
            !Number.isSafeInteger(item.id) ||
            item.id <= 0 ||
            !("name" in item) ||
            typeof item.name !== "string"
          )
            throw new Error("Invalid class");
          const designation = "designation" in item ? item.designation : null;
          if (designation !== null && typeof designation !== "string")
            throw new Error("Invalid designation");
          return { id: item.id, name: item.name, designation };
        });
        if (!controller.signal.aborted)
          setClassesState({ status: "ready", classes: list });
      } catch {
        if (!controller.signal.aborted) setClassesState({ status: "error" });
      }
    };
    void load();
    return () => controller.abort();
  }, [classAttempt]);

  const update = (patch: Record<string, string | null>, replace = false) => {
    const href = patchSessionUrl(window.location.href, patch);
    if (
      href ===
      `${window.location.pathname}${window.location.search}${window.location.hash}`
    )
      return;
    if (replace) window.history.replaceState(null, "", href);
    else window.history.pushState(null, "", href);
  };
  const reset = () =>
    update({
      q: null,
      sort: null,
      classId: null,
      onlyFull: null,
      onlyWithBookings: null,
      period: null,
    });
  const setPeriod = (period: SessionPeriod) =>
    update({ period: period === "upcoming" ? null : period, sort: null });
  const visible = now
    ? filterTeacherSessions(sessions, classes, filters, now)
    : [];
  const scoped = filters.hasClassFilter
    ? sessions.filter((session) => session.classId === filters.classId)
    : sessions;
  const periodCount = now
    ? scoped.filter(
        (session) =>
          filters.period === "all" ||
          (getSessionStatus(session, now) === "past") ===
            (filters.period === "past"),
      ).length
    : 0;
  const upcomingCount = now
    ? sessions.filter((session) => getSessionStatus(session, now) !== "past")
        .length
    : 0;
  const loading = isLoading || now === null;
  const selectedClass =
    filters.classId === null ? undefined : classMap.get(filters.classId);
  const missingClass =
    filters.hasClassFilter &&
    (filters.classId === null ||
      (classesState.status === "ready" && !selectedClass));
  const labelClass = (item: SessionClass) =>
    `${item.name}${item.designation ? ` · ${item.designation}` : ""}`;
  const active =
    filters.query !== "" ||
    filters.hasClassFilter ||
    filters.onlyFull ||
    filters.onlyWithBookings ||
    params.has("sort") ||
    filters.period !== "upcoming";
  const narrowed =
    filters.query.trim() !== "" || filters.onlyFull || filters.onlyWithBookings;
  const emptyTitle = narrowed
    ? text.noMatches
    : filters.period === "past"
      ? text.emptyPast
      : filters.period === "all"
        ? text.emptyAll
        : text.emptyUpcoming;
  const emptyDescription = narrowed
    ? text.noMatchesDescription
    : filters.period === "past"
      ? text.emptyPastDescription
      : filters.period === "all"
        ? text.emptyAllDescription
        : text.emptyUpcomingDescription;
  const number = new Intl.NumberFormat(language);
  const advancedFilters = [
    { key: "onlyFull", label: text.onlyFull, selected: filters.onlyFull },
    {
      key: "onlyWithBookings",
      label: text.onlyWithBookings,
      selected: filters.onlyWithBookings,
    },
  ];
  const filterCount = advancedFilters.filter((item) => item.selected).length;
  const sortOptions = [
    { value: "dateAsc", label: t.sessionFilters.sortDateAsc },
    { value: "dateDesc", label: t.sessionFilters.sortDateDesc },
    { value: "bookedFirst", label: t.sessionFilters.sortBookedFirst },
  ];
  const currentClassLabel = selectedClass
    ? labelClass(selectedClass)
    : filters.hasClassFilter
      ? filters.classId === null
        ? text.invalidClass
        : `${text.unknownClass} #${filters.classId}`
      : text.allClasses;
  const currentSortLabel =
    sortOptions.find((item) => item.value === filters.sort)?.label ?? "";
  const currentSortButtonLabel =
    filters.sort === "dateAsc"
      ? text.sortEarliest
      : filters.sort === "dateDesc"
        ? text.sortLatest
        : currentSortLabel;
  const scopedUpcoming = now
    ? scoped.filter((item) => getSessionStatus(item, now) !== "past").length
    : 0;
  const menuButtonSx = {
    minHeight: 52,
    minWidth: 0,
    px: 2,
    borderRadius: 3,
    textTransform: "none",
    fontWeight: 700,
    border: 1,
    borderColor: "divider",
    bgcolor: "background.paper",
    color: "text.primary",
    justifyContent: "flex-start",
    gap: 0.5,
    "& .MuiButton-startIcon": { color: "primary.main" },
    "& .MuiButton-endIcon": { ml: "auto", color: "text.secondary" },
    "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
    "&.Mui-focusVisible": {
      outline: "2px solid",
      outlineColor: "primary.main",
      outlineOffset: 2,
    },
  } as const;

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 3.5 },
          mb: 3,
          border: 1,
          borderColor: "divider",
          borderRadius: 5,
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            zIndex: -1,
            bgcolor: "primary.main",
            opacity: 0.06,
          },
        }}
      >
        <Stack
          direction="row"
          useFlexGap
          spacing={1}
          sx={{
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", color: "primary.main" }}
          >
            <SchoolOutlinedIcon sx={{ fontSize: 20 }} />
            <Typography
              variant="overline"
              sx={{ fontWeight: 800, letterSpacing: 1.2 }}
            >
              {t.common.teacher}
            </Typography>
          </Stack>
          <Button
            startIcon={<HelpOutlineRoundedIcon />}
            onClick={() => setHelpOpen(true)}
            aria-haspopup="dialog"
            sx={{ ...buttonSx, px: 1, minWidth: 0, fontWeight: 600 }}
          >
            {text.help}
          </Button>
        </Stack>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: "1.9rem", md: "2.35rem" },
            lineHeight: 1.15,
            mb: 1,
            letterSpacing: -0.8,
            fontWeight: 900,
          }}
        >
          {text.title}
        </Typography>
        <Typography color="text.secondary" sx={{ lineHeight: 1.65 }}>
          {text.description}
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2.5}
          sx={{
            mt: 2,
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
          }}
        >
          {loading ? (
            <Skeleton width={250} height={28} />
          ) : loadFailed ? (
            <Box />
          ) : (
            <Stack
              direction="row"
              useFlexGap
              spacing={2}
              sx={{ flexWrap: "wrap" }}
            >
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ alignItems: "center" }}
              >
                <EventOutlinedIcon
                  sx={{ color: "primary.main", fontSize: 19 }}
                />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {number.format(upcomingCount)} {text.upcomingCount}
                </Typography>
              </Stack>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ alignItems: "center" }}
              >
                <EventOutlinedIcon
                  sx={{ color: "primary.main", fontSize: 19 }}
                />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {number.format(sessions.length)} {text.totalCount}
                </Typography>
              </Stack>
            </Stack>
          )}
          <Button
            variant="contained"
            disableElevation
            startIcon={<AddRoundedIcon />}
            onClick={onCreate}
            sx={buttonSx}
          >
            {t.header.createSession}
          </Button>
        </Stack>
      </Paper>

      <Box
        component="section"
        id="teacher-sessions"
        aria-label={text.listLabel}
        data-navigation-loading={loading ? "true" : undefined}
        sx={{ scrollMarginTop: 110 }}
      >
        <Box sx={{ mb: 2.5 }}>
          <Stack
            direction="row"
            useFlexGap
            spacing={2}
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              mb: 2,
            }}
          >
            <Tabs
              value={filters.period}
              onChange={(_, value: SessionPeriod) => setPeriod(value)}
              aria-label={text.periodLabel}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 44,
                maxWidth: "100%",
                "& .MuiTabs-indicator": { display: "none" },
                "& .MuiTab-root": {
                  minHeight: 44,
                  minWidth: 0,
                  px: { xs: 1.25, sm: 2 },
                  mr: 0.5,
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: 999,
                  "&.Mui-selected": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                    color: "primary.main",
                  },
                  "&.Mui-focusVisible": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: -2,
                  },
                },
              }}
            >
              {[
                {
                  value: "upcoming",
                  label: text.upcoming,
                  count: scopedUpcoming,
                },
                {
                  value: "past",
                  label: text.past,
                  count: scoped.length - scopedUpcoming,
                },
                { value: "all", label: text.all, count: scoped.length },
              ].map((item) => (
                <Tab
                  key={item.value}
                  id={`${id}-${item.value}`}
                  aria-controls={`${id}-results`}
                  value={item.value}
                  label={
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center" }}
                    >
                      <span>{item.label}</span>
                      {!loading && !loadFailed && (
                        <Box
                          component="span"
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            minWidth: 22,
                            px: 0.5,
                            borderRadius: 99,
                            bgcolor: "action.hover",
                          }}
                        >
                          {number.format(item.count)}
                        </Box>
                      )}
                    </Stack>
                  }
                />
              ))}
            </Tabs>
            <Box role="status">
              {loading ? (
                <Skeleton width={100} />
              ) : (
                !loadFailed && (
                  <Typography variant="body2" color="text.secondary">
                    {t.sessionFilters.showing} {number.format(visible.length)}{" "}
                    {t.sessionFilters.of} {number.format(periodCount)}
                  </Typography>
                )
              )}
            </Box>
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "minmax(260px, 1fr) minmax(150px, 210px) minmax(190px, 240px) auto",
              },
              gap: 1.5,
            }}
          >
            <TextField
              fullWidth
              placeholder={text.searchPlaceholder}
              value={filters.query}
              onChange={(event) => update({ q: event.target.value }, true)}
              sx={{
                gridColumn: { xs: "auto", sm: "1 / -1", md: "auto" },
                "& .MuiOutlinedInput-root": {
                  height: 52,
                  px: 2,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  "& fieldset": { borderColor: "divider" },
                  "&:hover fieldset": { borderColor: "primary.main" },
                  "&.Mui-focused fieldset": { borderColor: "primary.main" },
                },
              }}
              slotProps={{
                htmlInput: { "aria-label": t.sessionFilters.searchLabel },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon sx={{ color: "primary.main" }} />
                    </InputAdornment>
                  ),
                  endAdornment: filters.query ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => update({ q: null }, true)}
                        aria-label={text.clearSearch}
                        sx={{ width: 44, height: 44 }}
                      >
                        <CloseRoundedIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                },
              }}
            />
            <Button
              id={`${id}-class-button`}
              startIcon={<SchoolOutlinedIcon />}
              endIcon={<ExpandMoreRoundedIcon />}
              disabled={classesState.status === "loading"}
              aria-label={`${text.classLabel}: ${currentClassLabel}`}
              aria-haspopup="menu"
              aria-expanded={menu?.kind === "class" ? true : undefined}
              aria-controls={
                menu?.kind === "class" ? `${id}-controls-menu` : undefined
              }
              onClick={(event) =>
                setMenu({ kind: "class", anchor: event.currentTarget })
              }
              sx={menuButtonSx}
            >
              <Box
                component="span"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentClassLabel}
              </Box>
            </Button>
            <Button
              id={`${id}-sort-button`}
              startIcon={<SortRoundedIcon />}
              endIcon={<ExpandMoreRoundedIcon />}
              aria-label={`${t.sessionFilters.sortLabel}: ${currentSortLabel}`}
              aria-haspopup="menu"
              aria-expanded={menu?.kind === "sort" ? true : undefined}
              aria-controls={
                menu?.kind === "sort" ? `${id}-controls-menu` : undefined
              }
              onClick={(event) =>
                setMenu({ kind: "sort", anchor: event.currentTarget })
              }
              sx={menuButtonSx}
            >
              <Box
                component="span"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentSortButtonLabel}
              </Box>
            </Button>
            <Button
              id={`${id}-filters-button`}
              startIcon={<FilterAltOutlinedIcon />}
              endIcon={<ExpandMoreRoundedIcon />}
              aria-haspopup="menu"
              aria-expanded={menu?.kind === "filters" ? true : undefined}
              aria-controls={
                menu?.kind === "filters" ? `${id}-controls-menu` : undefined
              }
              onClick={(event) =>
                setMenu({ kind: "filters", anchor: event.currentTarget })
              }
              sx={{
                ...menuButtonSx,
                color: filterCount ? "primary.main" : "text.primary",
                borderColor: filterCount ? "primary.main" : "divider",
                gridColumn: { sm: "1 / -1", md: "auto" },
                justifySelf: { sm: "start", md: "stretch" },
              }}
            >
              {text.filters}
              {filterCount > 0 ? ` · ${number.format(filterCount)}` : ""}
            </Button>
          </Box>
          {active && (
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ alignItems: "center", flexWrap: "wrap", mt: 1.5 }}
            >
              {filters.hasClassFilter && (
                <Chip
                  label={currentClassLabel}
                  onDelete={() => update({ classId: null })}
                  variant="outlined"
                  sx={{ maxWidth: "100%" }}
                />
              )}
              {advancedFilters
                .filter((item) => item.selected)
                .map((item) => (
                  <Chip
                    key={item.key}
                    label={item.label}
                    onDelete={() => update({ [item.key]: null })}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              <Button
                onClick={reset}
                startIcon={<RestartAltRoundedIcon />}
                sx={{ ...buttonSx, fontWeight: 600, px: 1 }}
              >
                {text.reset}
              </Button>
            </Stack>
          )}
          {classesState.status === "error" && (
            <Alert
              severity="warning"
              sx={{ mt: 2 }}
              action={
                <Button
                  color="inherit"
                  onClick={() => {
                    setClassesState({ status: "loading" });
                    setClassAttempt((value) => value + 1);
                  }}
                >
                  {text.retry}
                </Button>
              }
            >
              {text.classesFailed}
            </Alert>
          )}
          {missingClass && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {text.unavailableClass}
            </Alert>
          )}
          <Menu
            id={`${id}-controls-menu`}
            anchorEl={menu?.anchor ?? null}
            open={Boolean(menu)}
            onClose={() => setMenu(null)}
            slotProps={{
              list: {
                "aria-labelledby": menu
                  ? `${id}-${menu.kind}-button`
                  : undefined,
              },
              paper: {
                sx: {
                  mt: 0.75,
                  minWidth: 250,
                  maxWidth: "calc(100vw - 32px)",
                  maxHeight: 360,
                  borderRadius: 3,
                  border: 1,
                  borderColor: "divider",
                },
              },
            }}
          >
            {menu?.kind === "class" &&
              [
                { value: "", label: text.allClasses },
                ...[...classes]
                  .sort((a, b) =>
                    labelClass(a).localeCompare(labelClass(b), language),
                  )
                  .map((item) => ({
                    value: String(item.id),
                    label: labelClass(item),
                  })),
              ].map((item) => {
                const selected =
                  item.value ===
                  (filters.hasClassFilter ? String(filters.classId) : "");
                return (
                  <MenuItem
                    key={item.value}
                    role="menuitemradio"
                    aria-checked={selected}
                    selected={selected}
                    onClick={() => {
                      update({ classId: item.value || null });
                      setMenu(null);
                    }}
                    sx={{
                      minHeight: 44,
                      whiteSpace: "normal",
                      overflowWrap: "anywhere",
                    }}
                  >
                    <ListItemIcon>
                      {selected && <CheckRoundedIcon fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText>{item.label}</ListItemText>
                  </MenuItem>
                );
              })}
            {menu?.kind === "sort" &&
              sortOptions.map((item) => (
                <MenuItem
                  key={item.value}
                  role="menuitemradio"
                  aria-checked={filters.sort === item.value}
                  selected={filters.sort === item.value}
                  onClick={() => {
                    update({ sort: item.value });
                    setMenu(null);
                  }}
                  sx={{ minHeight: 44 }}
                >
                  <ListItemIcon>
                    {filters.sort === item.value && (
                      <CheckRoundedIcon fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText>{item.label}</ListItemText>
                </MenuItem>
              ))}
            {menu?.kind === "filters" &&
              advancedFilters.map((item) => (
                <MenuItem
                  key={item.key}
                  role="menuitemcheckbox"
                  aria-checked={item.selected}
                  selected={item.selected}
                  onClick={() =>
                    update({ [item.key]: item.selected ? null : "1" })
                  }
                  sx={{ minHeight: 44 }}
                >
                  <ListItemIcon>
                    {item.selected && <CheckRoundedIcon fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText>{item.label}</ListItemText>
                </MenuItem>
              ))}
          </Menu>
        </Box>

        <Box
          id={`${id}-results`}
          role="tabpanel"
          aria-labelledby={`${id}-${filters.period}`}
          aria-busy={loading}
        >
          {loading ? (
            <Stack
              spacing={2}
              role="status"
              aria-label={t.teacher.loadingSessions}
            >
              {[0, 1, 2].map((key) => (
                <Skeleton
                  key={key}
                  variant="rounded"
                  height={220}
                  sx={{ borderRadius: 4 }}
                />
              ))}
            </Stack>
          ) : loadFailed ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" onClick={onRetry}>
                  {text.retry}
                </Button>
              }
            >
              {text.loadFailed}
            </Alert>
          ) : (
            <>
              {visible.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, sm: 5 },
                    textAlign: "center",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 4,
                  }}
                >
                  <EventOutlinedIcon
                    sx={{ fontSize: 40, color: "primary.main", mb: 1.5 }}
                  />
                  <Typography
                    component="h2"
                    variant="h6"
                    sx={{ fontWeight: 800 }}
                  >
                    {emptyTitle}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ mt: 1, maxWidth: 500, mx: "auto" }}
                  >
                    {emptyDescription}
                  </Typography>
                  <Stack
                    direction="row"
                    useFlexGap
                    spacing={1}
                    sx={{ mt: 2.5, justifyContent: "center", flexWrap: "wrap" }}
                  >
                    {active && (
                      <Button variant="outlined" onClick={reset} sx={buttonSx}>
                        {text.reset}
                      </Button>
                    )}
                    {!narrowed && filters.period !== "past" && (
                      <Button
                        variant="contained"
                        disableElevation
                        startIcon={<AddRoundedIcon />}
                        onClick={onCreate}
                        sx={buttonSx}
                      >
                        {t.header.createSession}
                      </Button>
                    )}
                    {!narrowed && filters.period === "upcoming" && (
                      <Button onClick={() => setPeriod("past")} sx={buttonSx}>
                        {text.past}
                      </Button>
                    )}
                  </Stack>
                </Paper>
              ) : (
                <Stack
                  component="ul"
                  spacing={2}
                  sx={{ listStyle: "none", m: 0, p: 0 }}
                >
                  {visible.map((session) => (
                    <TeacherSessionCard
                      key={session.id}
                      session={session}
                      schoolClass={classMap.get(session.classId)}
                      now={now ?? ""}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </Stack>
              )}
            </>
          )}
        </Box>
      </Box>
      <Dialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        aria-labelledby={`${id}-help`}
        slotProps={{
          paper: { sx: classDialogPaperSx },
        }}
      >
        <ClassDialogHeader
          id={`${id}-help`}
          title={text.helpTitle}
          icon={<HelpOutlineRoundedIcon />}
        />
        <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack
            component="ul"
            spacing={3}
            sx={{ listStyle: "none", m: 0, p: 0 }}
          >
            {[
              {
                title: text.helpCreateTitle,
                description: text.helpCreate,
                icon: <EventOutlinedIcon />,
              },
              {
                title: text.helpFilterTitle,
                description: text.helpFilter,
                icon: <SearchOutlinedIcon />,
              },
              {
                title: text.helpManageTitle,
                description: text.helpManage,
                icon: <SettingsOutlinedIcon />,
              },
            ].map(({ title, description, icon }) => (
              <Stack
                component="li"
                direction="row"
                spacing={2}
                key={title}
                sx={{ alignItems: "flex-start" }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    borderRadius: 2.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "action.hover",
                    color: "primary.main",
                  }}
                >
                  {icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    component="h3"
                    variant="subtitle1"
                    sx={{ fontWeight: 800, mb: 0.5 }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                  >
                    {description}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{ px: { xs: 3, sm: 4 }, pb: { xs: 3, sm: 4 }, pt: 2 }}
        >
          <Button
            autoFocus
            onClick={() => setHelpOpen(false)}
            variant="contained"
            disableElevation
            sx={buttonSx}
          >
            {t.common.close}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
