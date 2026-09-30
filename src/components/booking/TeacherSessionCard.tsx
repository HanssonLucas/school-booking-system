"use client";

import { useId, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { useTranslations } from "@/i18n/useTranslations";
import {
  getSessionStatus,
  type SessionClass,
  type TeacherSession,
} from "@/lib/teacherSessionOverview";

type Props = {
  session: TeacherSession;
  schoolClass?: SessionClass;
  now: string;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function TeacherSessionCard({
  session,
  schoolClass,
  now,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const { t, language } = useTranslations();
  const text = t.teacherSessionsOverview;
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const status = getSessionStatus(session, now);
  const past = status === "past";
  const full = session.bookedParticipants >= session.maxParticipants;
  const statusLabel = past
    ? text.ended
    : status === "ongoing"
      ? text.ongoing
      : full
        ? t.bookingSession.full
        : text.scheduled;
  const accent = past ? "text.secondary" : "primary.main";
  const date = new Date(`${session.date}T12:00:00Z`);
  const validDate = !Number.isNaN(date.getTime());
  const formatDate = (options: Intl.DateTimeFormatOptions) =>
    validDate
      ? new Intl.DateTimeFormat(language, {
          ...options,
          timeZone: "UTC",
        }).format(date)
      : session.date;
  const closeMenu = () => {
    setAnchor(null);
    buttonRef.current?.focus();
  };
  const select = (action: (sessionId: number) => void) => {
    closeMenu();
    action(session.id);
  };
  const count = new Intl.NumberFormat(language);
  const bookingLabel = `${count.format(session.bookedParticipants)} ${t.bookingSession.of} ${count.format(session.maxParticipants)} ${text.booked}`;

  return (
    <Paper
      component="li"
      elevation={0}
      aria-labelledby={`${id}-title`}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 4,
        overflow: "hidden",
        bgcolor: "background.paper",
        transition: "border-color 160ms ease, box-shadow 160ms ease",
        "&:hover, &:focus-within": {
          borderColor: "primary.main",
          boxShadow: 2,
        },
        "@media (prefers-reduced-motion: reduce)": { transition: "none" },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "64px minmax(0, 1fr) auto",
            sm: "84px minmax(0, 1fr) auto",
          },
          gap: { xs: 1.5, sm: 2.5 },
          p: { xs: 2, sm: 3 },
          alignItems: "start",
        }}
      >
        <Box
          component="time"
          dateTime={session.date}
          aria-label={formatDate({ dateStyle: "full" })}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 1.5,
            borderRadius: 3,
            color: accent,
            position: "relative",
            isolation: "isolate",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              zIndex: -1,
              bgcolor: past ? "text.primary" : "primary.main",
              opacity: 0.09,
            },
          }}
        >
          <Typography
            component="span"
            aria-hidden
            sx={{
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            {formatDate({ month: "short" })}
          </Typography>
          <Typography
            component="span"
            aria-hidden
            sx={{ fontSize: "2rem", fontWeight: 900, lineHeight: 1.2 }}
          >
            {formatDate({ day: "numeric" })}
          </Typography>
          <Typography
            component="span"
            aria-hidden
            variant="caption"
            sx={{ color: "text.secondary" }}
          >
            {formatDate({ year: "numeric" })}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: "center", color: "text.secondary", mb: 0.75 }}
          >
            <SchoolOutlinedIcon sx={{ fontSize: 17, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
              {schoolClass?.name ?? `${text.unknownClass} #${session.classId}`}
              {schoolClass?.designation ? ` · ${schoolClass.designation}` : ""}
            </Typography>
          </Stack>
          <Typography
            id={`${id}-title`}
            component="h3"
            sx={{
              fontSize: { xs: "1.25rem", sm: "1.45rem" },
              fontWeight: 800,
              letterSpacing: -0.4,
              lineHeight: 1.35,
              overflowWrap: "anywhere",
            }}
          >
            {session.title}
          </Typography>
          <Stack
            direction="row"
            useFlexGap
            spacing={1}
            sx={{ flexWrap: "wrap", alignItems: "center", mt: 1 }}
          >
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
              <AccessTimeOutlinedIcon
                sx={{ fontSize: 17, color: "text.secondary" }}
              />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {session.startTime.slice(0, 5)}–{session.endTime.slice(0, 5)}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              · {session.slotDurationMinutes} {text.minutes}
            </Typography>
          </Stack>
          {session.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                overflowWrap: "anywhere",
                lineHeight: 1.6,
              }}
            >
              {session.description}
            </Typography>
          )}
        </Box>
        <Tooltip title={text.actions}>
          <IconButton
            ref={buttonRef}
            id={`${id}-actions`}
            onClick={(event) => setAnchor(event.currentTarget)}
            aria-label={`${text.actions}: ${session.title}`}
            aria-haspopup="menu"
            aria-expanded={anchor ? true : undefined}
            aria-controls={anchor ? `${id}-menu` : undefined}
            sx={{ width: 44, height: 44 }}
          >
            <MoreHorizRoundedIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          borderTop: 1,
          borderColor: "divider",
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          sx={{ flexWrap: "wrap", alignItems: "center", minWidth: 0 }}
        >
          <Chip
            size="small"
            label={statusLabel}
            variant="outlined"
            color={
              past
                ? "default"
                : status === "ongoing"
                  ? "success"
                  : full
                    ? "warning"
                    : "primary"
            }
            sx={{ fontWeight: 700 }}
          />
          <Box sx={{ minWidth: 150 }}>
            <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 700 }}>
              {bookingLabel}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={
                session.maxParticipants > 0
                  ? Math.min(
                      100,
                      Math.max(
                        0,
                        (session.bookedParticipants / session.maxParticipants) *
                          100,
                      ),
                    )
                  : 0
              }
              aria-label={bookingLabel}
              sx={{
                height: 5,
                borderRadius: 99,
                bgcolor: "action.hover",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 99,
                  bgcolor: past ? "text.disabled" : "primary.main",
                  transition: "none",
                },
              }}
            />
          </Box>
        </Stack>
        <Button
          variant="contained"
          disableElevation
          startIcon={<GroupsOutlinedIcon />}
          endIcon={<ArrowForwardRoundedIcon />}
          onClick={() => onView(session.id)}
          aria-label={`${t.bookingSession.viewBookingsButton}: ${session.title}`}
          sx={{
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 800,
            minHeight: 44,
            px: 2.5,
            flexShrink: 0,
            alignSelf: { xs: "flex-start", sm: "center" },
          }}
        >
          {t.bookingSession.viewBookingsButton}
        </Button>
      </Stack>
      <Menu
        id={`${id}-menu`}
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={closeMenu}
        disableRestoreFocus
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          list: { "aria-labelledby": `${id}-actions` },
          paper: {
            sx: {
              minWidth: 200,
              borderRadius: 3,
              border: 1,
              borderColor: "divider",
            },
          },
        }}
      >
        <MenuItem onClick={() => select(onEdit)} sx={{ minHeight: 44 }}>
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t.bookingSession.editButton}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => select(onDelete)}
          sx={{ minHeight: 44, color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "error.main" }}>
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t.bookingSession.deleteButton}</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
}
