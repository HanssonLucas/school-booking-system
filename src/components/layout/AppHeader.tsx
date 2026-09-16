"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
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
import { useAuth } from "@/components/auth/useAuth";
import HeaderAuthActions from "@/components/auth/HeaderAuthActions";
import { useTranslations } from "@/i18n/useTranslations";
import { useAppTheme } from "@/theme/AppThemeProvider";

export default function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const { t, language, setLanguage } = useTranslations();

  const closeMenu = () => setIsMenuOpen(false);

  const links = !user
    ? [
        {
          label: t.header.howItWorks,
          href: "/#getting-started",
        },
        {
          label: t.header.examples,
          href: "/#booking-preview",
        },
      ]
    : user.role === "teacher"
      ? [
          {
            label: t.header.mySessions,
            href: "/teacher#teacher-sessions",
          },
          {
            label: t.header.myClasses,
            href: "/teacher#teacher-classes",
          },
        ]
      : [
          {
            label: t.header.bookSession,
            href: "/student#available-sessions",
          },
          {
            label: t.header.myBookings,
            href: "/student?dialog=my-bookings",
          },
        ];

  const navigation = (mobile: boolean) => (
    <Stack
      component="nav"
      aria-label={t.header.navigation}
      direction={mobile ? "column" : "row"}
      spacing={mobile ? 1 : 0.5}
      sx={{ alignItems: mobile ? "stretch" : "center" }}
    >
      {isLoading ? (
        <Skeleton variant="rounded" width={mobile ? "100%" : 230} height={44} />
      ) : (
        <>
          {links.map((link) => (
            <Button
              key={link.href}
              component={Link}
              href={link.href}
              onClick={closeMenu}
              color="inherit"
              sx={{
                minHeight: 44,
                px: 1.5,
                borderRadius: 2,
                justifyContent: mobile ? "flex-start" : "center",
                textTransform: "none",
                fontWeight: 600,
                whiteSpace: "nowrap",
                "&:hover": {
                  bgcolor: "action.hover",
                  color: "primary.main",
                },
              }}
            >
              {link.label}
            </Button>
          ))}

          {user?.role === "teacher" && (
            <Button
              component={Link}
              href="/teacher?dialog=create-session"
              onClick={closeMenu}
              variant="contained"
              disableElevation
              startIcon={<AddRoundedIcon />}
              sx={{
                minHeight: 44,
                px: 2,
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              {t.header.createSession}
            </Button>
          )}
        </>
      )}
    </Stack>
  );

  const languageControls = (
    <Stack
      direction="row"
      role="group"
      aria-label={t.common.languageLabel}
      spacing={0.5}
    >
      {(["sv", "en"] as const).map((value) => (
        <Button
          key={value}
          size="small"
          onClick={() => setLanguage(value)}
          aria-pressed={language === value}
          aria-label={
            value === "sv" ? t.common.switchToSwedish : t.common.switchToEnglish
          }
          sx={{
            minWidth: 40,
            minHeight: 44,
            borderRadius: 2,
            fontWeight: 700,
            color: language === value ? "primary.main" : "text.secondary",
            bgcolor: language === value ? "action.selected" : "transparent",
          }}
        >
          {value.toUpperCase()}
        </Button>
      ))}
    </Stack>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, lg: 76 },
          px: { xs: 2, sm: 3, lg: 4 },
          gap: 2,
          justifyContent: "space-between",
        }}
      >
        <Typography
          component={Link}
          href="/"
          onClick={closeMenu}
          sx={{
            minWidth: 0,
            color: "text.primary",
            textDecoration: "none",
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
            fontWeight: 750,
            letterSpacing: "-0.5px",
            lineHeight: 1.3,
            "&:hover": { color: "primary.main" },
          }}
        >
          {t.common.appName}
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          sx={{
            display: { xs: "none", xl: "flex" },
            alignItems: "center",
          }}
        >
          {navigation(false)}

          <Divider orientation="vertical" flexItem />

          <HeaderAuthActions />

          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <ThemeToggle />
            {languageControls}
          </Stack>
        </Stack>

        <IconButton
          onClick={() => setIsMenuOpen(true)}
          aria-label={t.common.openNavigationMenu}
          aria-expanded={isMenuOpen}
          aria-controls={isMenuOpen ? "mobile-navigation" : undefined}
          aria-haspopup="dialog"
          sx={{
            display: { xs: "inline-flex", xl: "none" },
            width: 44,
            height: 44,
            flexShrink: 0,
            color: "text.primary",
          }}
        >
          <MenuRoundedIcon />
        </IconButton>
      </Toolbar>

      <Drawer
        anchor="right"
        open={isMenuOpen}
        onClose={closeMenu}
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
              sx={{ fontWeight: 800, fontSize: "1.125rem" }}
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

          <Divider />

          <HeaderAuthActions mobile onNavigate={closeMenu} />

          <Divider />

          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            {languageControls}
            <ThemeToggle />
          </Stack>
        </Stack>
      </Drawer>
    </AppBar>
  );
}

function ThemeToggle() {
  const { mode, toggleColorMode } = useAppTheme();
  const { t } = useTranslations();

  return (
    <IconButton
      onClick={toggleColorMode}
      aria-label={
        mode === "light"
          ? t.common.switchToDarkMode
          : t.common.switchToLightMode
      }
      sx={{ width: 44, height: 44, color: "text.secondary" }}
    >
      {mode === "light" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
    </IconButton>
  );
}
