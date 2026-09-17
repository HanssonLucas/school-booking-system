"use client";

import { useId, useRef, useState } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useTranslations } from "@/i18n/useTranslations";
import { classButtonSx } from "./ClassDialogHeader";

export type TeacherClassCardData = {
  id: number;
  name: string;
  studentCount: number;
  upcomingSessionCount: number;
  nextSession: {
    id: number;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
  } | null;
};

type TeacherClassCardProps = {
  schoolClass: TeacherClassCardData;
  onOpenClass: () => void;
  onRename: () => void;
  onRegenerateCode: () => void;
  onDelete: () => void;
};

export default function TeacherClassCard({
  schoolClass,
  onOpenClass,
  onRename,
  onRegenerateCode,
  onDelete,
}: TeacherClassCardProps) {
  const { t, language } = useTranslations();
  const text = t.teacherClasses;
  // The ID stays the same when the class is renamed or the list is reordered.
  const accent = ["#3685c4", "#16877f", "#8562ba"][schoolClass.id % 3];
  const studentLabel =
    schoolClass.studentCount === 1 ? text.studentSingular : text.studentPlural;
  const nextSession = schoolClass.nextSession;
  // Format a calendar date without shifting it to the browser's time zone.
  const nextDate = nextSession
    ? new Date(`${nextSession.date}T00:00:00Z`)
    : null;
  const formattedDate =
    nextDate && Number.isFinite(nextDate.getTime())
      ? new Intl.DateTimeFormat(language === "sv" ? "sv-SE" : "en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }).format(nextDate)
      : nextSession?.date;
  const id = useId();
  const menuButton = useRef<HTMLButtonElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(anchorEl);

  const closeMenu = () => {
    setAnchorEl(null);
    menuButton.current?.focus();
  };
  const selectAction = (action: () => void) => {
    // Restore focus to the persistent button before the dialog opens.
    closeMenu();
    action();
  };

  return (
    <Paper
      component="li"
      elevation={0}
      aria-labelledby={`${id}-title`}
      sx={{
        minWidth: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: 1,
        borderColor: "divider",
        borderTop: "4px solid",
        borderTopColor: accent,
        borderRadius: 4,
        bgcolor: "background.paper",
        overflow: "hidden",
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
          position: "relative",
          isolation: "isolate",
          p: { xs: 2.5, sm: 3 },
          flex: 1,
          "&::before": {
            content: '\"\"',
            position: "absolute",
            inset: 0,
            zIndex: -1,
            bgcolor: accent,
            opacity: 0.055,
            pointerEvents: "none",
          },
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 2.5,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              position: "relative",
              display: "grid",
              placeItems: "center",
              color: accent,
              "&::before": {
                content: '\"\"',
                position: "absolute",
                inset: 0,
                borderRadius: "inherit",
                bgcolor: accent,
                opacity: 0.12,
              },
            }}
          >
            <SchoolOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Tooltip title={text.classActions}>
            <IconButton
              ref={menuButton}
              id={`${id}-actions`}
              aria-label={`${text.classActions}: ${schoolClass.name}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen ? true : undefined}
              aria-controls={menuOpen ? `${id}-menu` : undefined}
              onClick={(event) => setAnchorEl(event.currentTarget)}
              sx={{ width: 44, height: 44, color: "text.secondary" }}
            >
              <MoreHorizRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        <Typography
          id={`${id}-title`}
          component="h2"
          sx={{
            fontSize: { xs: "1.25rem", sm: "1.45rem" },
            fontWeight: 800,
            letterSpacing: -0.4,
            lineHeight: 1.35,
            overflowWrap: "anywhere",
            mt: 0.5,
          }}
        >
          {schoolClass.name}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 2 }}>
          <GroupsOutlinedIcon
            fontSize="small"
            sx={{ color: "text.secondary" }}
          />
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {new Intl.NumberFormat(language).format(schoolClass.studentCount)}{" "}
            {studentLabel}
          </Typography>
        </Stack>
        {/* Keep the hint's natural height in the two-column layout. */}
        <Typography
          variant="body2"
          color="text.secondary"
          aria-hidden={schoolClass.studentCount > 0 ? true : undefined}
          sx={{
            mt: 1,
            lineHeight: 1.6,
            display:
              schoolClass.studentCount === 0
                ? "block"
                : { xs: "none", md: "block" },
            visibility: schoolClass.studentCount === 0 ? "visible" : "hidden",
          }}
        >
          {text.emptyClassHint}
        </Typography>
        <Box
          sx={{
            mt: 1.5,
            pt: 1.5,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <CalendarMonthOutlinedIcon
              fontSize="small"
              sx={{ color: "text.secondary", flexShrink: 0 }}
            />
            <Typography
              variant="body2"
              color={nextSession ? "text.primary" : "text.secondary"}
              sx={{ fontWeight: nextSession ? 700 : 400, lineHeight: 1.6 }}
            >
              {nextSession ? (
                <>
                  {new Intl.NumberFormat(language).format(
                    schoolClass.upcomingSessionCount,
                  )}{" "}
                  {schoolClass.upcomingSessionCount === 1
                    ? text.upcomingSessionSingular
                    : text.upcomingSessionPlural}
                </>
              ) : (
                text.noUpcomingSessions
              )}
            </Typography>
          </Stack>
          {nextSession && (
            <Box sx={{ mt: 1.5, minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                {text.nextSessionLabel}
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 0.25, fontWeight: 700, overflowWrap: "anywhere" }}
              >
                {nextSession.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, lineHeight: 1.6 }}
              >
                <time dateTime={nextSession.date}>{formattedDate}</time>
                {" · "}
                {nextSession.startTime}–{nextSession.endTime}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          px: { xs: 2.5, sm: 3 },
          py: 1.5,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Button
          variant="contained"
          disableElevation
          startIcon={<GroupsOutlinedIcon />}
          endIcon={<ArrowForwardRoundedIcon />}
          onClick={onOpenClass}
          aria-label={`${text.openClass}: ${schoolClass.name}`}
          sx={{ ...classButtonSx, minHeight: 44, px: 2.5 }}
        >
          {text.openClass}
        </Button>
      </Box>
      <Menu
        id={`${id}-menu`}
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={closeMenu}
        disableRestoreFocus
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          list: { "aria-labelledby": `${id}-actions` },
          paper: {
            sx: {
              minWidth: 220,
              borderRadius: 3,
              mt: 0.5,
              border: 1,
              borderColor: "divider",
            },
          },
        }}
      >
        <MenuItem onClick={() => selectAction(onRename)} sx={{ minHeight: 44 }}>
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{text.rename}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => selectAction(onRegenerateCode)}
          sx={{ minHeight: 44 }}
        >
          <ListItemIcon>
            <RefreshOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{text.newCode}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => selectAction(onDelete)}
          sx={{ minHeight: 44, color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "error.main" }}>
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{text.deleteClass}</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
}
