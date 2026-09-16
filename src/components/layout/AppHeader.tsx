"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useAuth } from "@/components/auth/useAuth";
import { useTranslations } from "@/i18n/useTranslations";
import { useAppTheme } from "@/theme/AppThemeProvider";
import useAnchorNavigation from "@/components/layout/useAnchorNavigation";

function subscribeLocation(callback: () => void) {
  window.addEventListener("hashchange", callback);
  window.addEventListener("popstate", callback);
  window.addEventListener("booking:navigation", callback);
  return () => {
    window.removeEventListener("hashchange", callback);
    window.removeEventListener("popstate", callback);
    window.removeEventListener("booking:navigation", callback);
  };
}
const getLocation = () =>
  window.location.pathname + window.location.search + window.location.hash;
const getServerLocation = () => "";
const pillSx = {
  borderRadius: 999,
  textTransform: "none",
  fontWeight: 750,
  px: 2,
  minHeight: 44,
};

export default function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const { t } = useTranslations();
  const pathname = usePathname();
  const location = useSyncExternalStore(
    subscribeLocation,
    getLocation,
    getServerLocation,
  );
  useAnchorNavigation();
  const closeMenu = () => setIsMenuOpen(false);
  const links = !user
    ? [
        {
          label: t.header.howItWorks,
          href: "/#getting-started",
          icon: <RouteOutlinedIcon />,
        },
        {
          label: t.header.examples,
          href: "/#booking-preview",
          icon: <VisibilityOutlinedIcon />,
        },
      ]
    : user.role === "teacher"
      ? [
          {
            label: t.header.mySessions,
            href: "/teacher#teacher-sessions",
            icon: <CalendarMonthOutlinedIcon />,
          },
          {
            label: t.header.myClasses,
            href: "/teacher#teacher-classes",
            icon: <GroupsOutlinedIcon />,
          },
        ]
      : [
          {
            label: t.header.bookSession,
            href: "/student#available-sessions",
            icon: <EventAvailableOutlinedIcon />,
          },
          {
            label: t.header.myBookings,
            href: "/student?dialog=my-bookings",
            icon: <EventNoteOutlinedIcon />,
          },
        ];

  const navigation = (mobile: boolean) => (
    <Stack
      component="nav"
      aria-label={t.header.navigation}
      direction={mobile ? "column" : "row"}
      spacing={mobile ? 1 : 2}
      sx={{ alignItems: mobile ? "stretch" : "center" }}
    >
      {isLoading ? (
        <Skeleton width={mobile ? "100%" : 220} height={44} />
      ) : (
        links.map((link) => {
          const active =
            location === link.href && pathname === link.href.split(/[?#]/)[0];
          return (
            <Button
              key={link.href}
              component={Link}
              href={link.href}
              scroll={false}
              onClick={closeMenu}
              aria-current={active ? "location" : undefined}
              startIcon={link.icon}
              sx={{
                position: "relative",
                minHeight: 48,
                px: 1.5,
                borderRadius: 2,
                justifyContent: mobile ? "flex-start" : "center",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.9rem",
                whiteSpace: "nowrap",
                color: active ? "primary.main" : "text.primary",
                bgcolor: active ? "action.hover" : "transparent",
                transition: "background-color 160ms ease, color 160ms ease",
                "& .MuiButton-startIcon": { color: "primary.main", mr: 1.25 },
                "& .MuiButton-startIcon > *:nth-of-type(1)": { fontSize: 23 },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: 14,
                  right: 14,
                  bottom: 0,
                  height: 2,
                  borderRadius: 999,
                  bgcolor: "primary.main",
                  opacity: active ? 1 : 0,
                },
                "&:hover": { bgcolor: "action.hover", color: "primary.main" },
                "@media (prefers-reduced-motion: reduce)": {
                  transition: "none",
                },
              }}
            >
              {link.label}
            </Button>
          );
        })
      )}
    </Stack>
  );

  const createButton =
    !isLoading && user?.role === "teacher" ? (
      <Button
        component={Link}
        href="/teacher?dialog=create-session"
        onClick={closeMenu}
        variant="contained"
        disableElevation
        startIcon={<AddRoundedIcon />}
        sx={pillSx}
      >
        {t.header.createSession}
      </Button>
    ) : null;

  return (
    <AppBar
      data-app-header
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
        backgroundImage: "none",
        isolation: "isolate",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          zIndex: -1,
          bgcolor: "primary.main",
          opacity: 0.08,
          pointerEvents: "none",
        },
      }}
    >
      <Toolbar
        sx={{
          width: "100%",
          boxSizing: "border-box",
          minHeight: { xs: 72, sm: 80, xl: 88 },
          px: { xs: 2, sm: 3, xl: 5 },
          gap: { xs: 2, xl: 3 },
          display: { xs: "flex", xl: "grid" },
          gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
        }}
      >
        <Box
          component={Link}
          href="/"
          onClick={closeMenu}
          aria-label={`Samspel · ${t.auth.goToHome}`}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1.5,
            width: "fit-content",
            minWidth: 0,
            textDecoration: "none",
            color: "text.primary",
            flexShrink: 0,
            borderRadius: 2,
            "&:hover .samspel-mark": { transform: "translateY(-2px)" },
            "&:focus-visible": {
              outline: "2px solid",
              outlineColor: "primary.main",
              outlineOffset: 6,
            },
            "@media (prefers-reduced-motion: reduce)": {
              "&:hover .samspel-mark": { transform: "none" },
            },
          }}
        >
          <Box
            className="samspel-mark"
            sx={{
              width: { xs: 32, sm: 40 },
              height: { xs: 40, sm: 48 },
              color: "primary.main",
              flexShrink: 0,
              transition: "transform 160ms ease",
              "@media (prefers-reduced-motion: reduce)": { transition: "none" },
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 44 56"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M34 3C28 9 14 9 7 14C4 16 3 19 4 23L35 16C40 15 42 12 39 9L34 3Z"
                fill="currentColor"
              />
              <path
                d="M4 20C3 26 8 29 15 31L29 35C34 37 37 39 37 43C43 35 41 28 33 25L13 20C9 19 6 18 6 16L4 20Z"
                fill="currentColor"
                opacity="0.7"
              />
              <path
                d="M37 39L10 44C5 45 4 48 7 51L11 55C17 48 29 49 35 44C37 43 38 41 37 39Z"
                fill="currentColor"
              />
            </svg>
          </Box>
          <Typography
            component="span"
            sx={{
              fontWeight: 750,
              letterSpacing: "-1.2px",
              lineHeight: 1,
              fontSize: { xs: "1.65rem", sm: "2rem" },
            }}
          >
            samspel
            <Box component="span" sx={{ color: "primary.main" }}>
              .
            </Box>
          </Typography>
        </Box>

        <Box
          sx={{ display: { xs: "none", xl: "block" }, justifySelf: "center" }}
        >
          {navigation(false)}
        </Box>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            display: { xs: "none", xl: "flex" },
            alignItems: "center",
            justifySelf: "end",
            whiteSpace: "nowrap",
          }}
        >
          {createButton}
          <HeaderPreferences />
          <Divider orientation="vertical" flexItem sx={{ my: 1 }} />
          <HeaderAccount onNavigate={closeMenu} />
        </Stack>
        <IconButton
          onClick={() => setIsMenuOpen(true)}
          aria-label={t.common.openNavigationMenu}
          aria-expanded={isMenuOpen}
          aria-haspopup="dialog"
          aria-controls={isMenuOpen ? "mobile-navigation" : undefined}
          sx={{
            ml: "auto",
            display: { xs: "inline-flex", xl: "none" },
            width: 44,
            height: 44,
          }}
        >
          <MenuRoundedIcon />
        </IconButton>
      </Toolbar>
      <Drawer
        anchor="right"
        open={isMenuOpen}
        onClose={closeMenu}
        ModalProps={{ disableScrollLock: true }}
        slotProps={{
          paper: {
            id: "mobile-navigation",
            role: "dialog",
            "aria-modal": true,
            "aria-labelledby": "mobile-navigation-title",
            sx: {
              width: 360,
              maxWidth: "100vw",
              p: 3,
              bgcolor: "background.paper",
              backgroundImage: "none",
            },
          },
        }}
      >
        <Stack spacing={3}>
          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Typography
              id="mobile-navigation-title"
              component="h2"
              sx={{ fontWeight: 800 }}
            >
              {t.common.navigationMenu}
            </Typography>
            <IconButton
              onClick={closeMenu}
              aria-label={t.common.closeNavigationMenu}
              sx={{ width: 44, height: 44 }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
          {navigation(true)}
          {createButton}
          <Divider />
          <HeaderAccount mobile onNavigate={closeMenu} />
          <Divider />
          <HeaderPreferences />
        </Stack>
      </Drawer>
    </AppBar>
  );
}

function HeaderPreferences() {
  const { mode, toggleColorMode } = useAppTheme();
  const { t, language, setLanguage } = useTranslations();
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
      <IconButton
        onClick={toggleColorMode}
        aria-label={
          mode === "light"
            ? t.common.switchToDarkMode
            : t.common.switchToLightMode
        }
        sx={{ width: 44, height: 44, color: "text.secondary" }}
      >
        {mode === "light" ? (
          <DarkModeOutlinedIcon />
        ) : (
          <LightModeOutlinedIcon />
        )}
      </IconButton>
      <Box
        role="group"
        aria-label={t.common.languageLabel}
        sx={{ display: "flex" }}
      >
        {(["sv", "en"] as const).map((value) => (
          <Button
            key={value}
            onClick={() => setLanguage(value)}
            aria-pressed={language === value}
            aria-label={
              value === "sv"
                ? t.common.switchToSwedish
                : t.common.switchToEnglish
            }
            sx={{
              minWidth: 36,
              minHeight: 44,
              fontSize: "0.75rem",
              fontWeight: 800,
              borderRadius: 2,
              color: language === value ? "primary.main" : "text.secondary",
              textDecoration: language === value ? "underline" : "none",
              textUnderlineOffset: "5px",
            }}
          >
            {value.toUpperCase()}
          </Button>
        ))}
      </Box>
    </Stack>
  );
}

function HeaderAccount({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate: () => void;
}) {
  const { user, isLoading, logout } = useAuth();
  const { t } = useTranslations();
  const router = useRouter();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const close = () => setAnchor(null);
  const handleLogout = async () => {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      await logout();
      close();
      onNavigate();
      router.push("/");
      router.refresh();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };
  if (isLoading) return <Skeleton width={120} height={44} />;
  if (!user)
    return (
      <Stack direction={mobile ? "column" : "row"} spacing={1}>
        <Button
          component={Link}
          href="/login"
          onClick={onNavigate}
          color="inherit"
          sx={pillSx}
        >
          {t.auth.loginButton}
        </Button>
        <Button
          component={Link}
          href="/register"
          onClick={onNavigate}
          variant="contained"
          disableElevation
          sx={pillSx}
        >
          {t.auth.registerButton}
        </Button>
      </Stack>
    );
  const accountItems = [
    <MenuItem
      key="profile"
      component={Link}
      href="/profile"
      onClick={() => {
        close();
        onNavigate();
      }}
      sx={{ gap: 1.5, minHeight: 44, borderRadius: 2 }}
    >
      <PersonOutlineOutlinedIcon fontSize="small" />
      {t.profile.title}
    </MenuItem>,
    <MenuItem
      key="logout"
      onClick={handleLogout}
      disabled={busy}
      sx={{ gap: 1.5, minHeight: 44, borderRadius: 2 }}
    >
      <LogoutOutlinedIcon fontSize="small" />
      {t.auth.logoutButton}
    </MenuItem>,
    failed ? (
      <Alert key="error" severity="error" sx={{ m: 1 }}>
        {t.errors.unknown}
      </Alert>
    ) : null,
  ];
  const identity = (
    <>
      <Avatar
        sx={{
          width: 34,
          height: 34,
          bgcolor: "action.selected",
          color: "primary.main",
          fontWeight: 800,
          fontSize: "0.9rem",
        }}
      >
        {user.name.trim().slice(0, 1).toUpperCase()}
      </Avatar>
      <Box component="span" sx={{ textAlign: "left", minWidth: 0 }}>
        <Typography
          component="span"
          noWrap
          sx={{
            display: "block",
            maxWidth: 120,
            fontSize: "0.85rem",
            fontWeight: 750,
          }}
        >
          {user.name}
        </Typography>
        <Typography
          component="span"
          sx={{ display: "block", fontSize: "0.7rem", color: "text.secondary" }}
        >
          {user.role === "teacher" ? t.auth.teacherRole : t.auth.studentRole}
        </Typography>
      </Box>
    </>
  );
  if (mobile)
    return (
      <Stack spacing={1}>
        <Stack
          direction="row"
          spacing={1.25}
          sx={{ alignItems: "center", mb: 1 }}
        >
          {identity}
        </Stack>
        {accountItems}
      </Stack>
    );
  return (
    <>
      <Button
        onClick={(event) => setAnchor(event.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        aria-controls={anchor ? "header-account-menu" : undefined}
        sx={{
          gap: 1,
          color: "text.primary",
          textTransform: "none",
          borderRadius: 3,
          minHeight: 48,
        }}
      >
        {identity}
        <ExpandMoreRoundedIcon fontSize="small" />
      </Button>
      <Menu
        id="header-account-menu"
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 0.5,
              minWidth: 210,
              borderRadius: 3,
              border: 1,
              borderColor: "divider",
            },
          },
        }}
      >
        {accountItems}
      </Menu>
    </>
  );
}
