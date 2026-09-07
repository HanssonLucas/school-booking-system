"use client";

import {
  AppBar,
  Box,
  Button,
  Divider,
  IconButton,
  Popover,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/useTranslations";
import { useAppTheme } from "@/theme/AppThemeProvider";
import HeaderAuthActions from "@/components/auth/HeaderAuthActions";
import { useState } from "react";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useAuth } from "@/components/auth/useAuth";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const { t, language, setLanguage } = useTranslations();
  const { mode, toggleColorMode } = useAppTheme();
  const { user, isLoading } = useAuth();
  const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null);

  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const isMenuOpen = Boolean(menuAnchor) && !isDesktop;

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const navigateFromMenu = (path: string) => {
    closeMenu();
    router.push(path);
  };

  const isStudentPage = pathname === "/student";
  const isTeacherPage = pathname === "/teacher";

  const navButtonSx = (isActive: boolean) => ({
    borderRadius: 999,
    textTransform: "none",
    fontWeight: 800,
    px: 2.25,
    color: isActive ? "primary.contrastText" : "text.primary",
    bgcolor: isActive ? "primary.main" : "action.hover",
    boxShadow: isActive ? 3 : 0,
    "&:hover": {
      bgcolor: isActive ? "primary.dark" : "action.selected",
    },
  });

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
        backdropFilter: "blur(12px)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: 72,
          px: { xs: 2, sm: 4 },
          gap: 2,
          justifyContent: "space-between",
        }}
      >
        <Box
          component="button"
          onClick={() => router.push("/")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexGrow: 0,
            minWidth: 0,
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            textAlign: "left",
            p: 0,
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              background:
                mode === "light"
                  ? "linear-gradient(135deg, #1976d2, #42a5f5)"
                  : "linear-gradient(135deg, #90caf9, #1976d2)",
              color: "primary.contrastText",
              boxShadow: 4,
              flexShrink: 0,
            }}
          >
            <CalendarMonthOutlinedIcon />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 900,
                letterSpacing: -0.5,
                lineHeight: 1.1,
              }}
            >
              {t.common.appName}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: { xs: "none", sm: "block" },
                lineHeight: 1.2,
              }}
            >
              {t.common.appSubtitle}
            </Typography>
          </Box>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            display: { xs: "none", lg: "flex" },
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Button
            onClick={() => router.push("/student")}
            sx={navButtonSx(isStudentPage)}
          >
            {t.common.student}
          </Button>

          <Button
            onClick={() => router.push("/teacher")}
            sx={navButtonSx(isTeacherPage)}
          >
            {t.common.teacher}
          </Button>

          <HeaderAuthActions />

          <IconButton
            onClick={toggleColorMode}
            aria-label={
              mode === "light"
                ? t.common.switchToDarkMode
                : t.common.switchToLightMode
            }
            sx={{
              width: 40,
              height: 40,
              borderRadius: 999,
              bgcolor: "action.hover",
              color: "text.primary",
              "&:hover": {
                bgcolor: "action.selected",
              },
            }}
          >
            {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>

          <Box
            aria-label={t.common.languageLabel}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              p: 0.5,
              borderRadius: 999,
              bgcolor: "action.hover",
            }}
          >
            <Button
              size="small"
              onClick={() => setLanguage("sv")}
              aria-label={t.common.switchToSwedish}
              sx={{
                minWidth: 42,
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 900,
                px: 1.25,
                color:
                  language === "sv" ? "primary.contrastText" : "text.primary",
                bgcolor: language === "sv" ? "primary.main" : "transparent",
                "&:hover": {
                  bgcolor:
                    language === "sv" ? "primary.dark" : "action.selected",
                },
              }}
            >
              SV
            </Button>

            <Button
              size="small"
              onClick={() => setLanguage("en")}
              aria-label={t.common.switchToEnglish}
              sx={{
                minWidth: 42,
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 900,
                px: 1.25,
                color:
                  language === "en" ? "primary.contrastText" : "text.primary",
                bgcolor: language === "en" ? "primary.main" : "transparent",
                "&:hover": {
                  bgcolor:
                    language === "en" ? "primary.dark" : "action.selected",
                },
              }}
            >
              EN
            </Button>
          </Box>
        </Stack>
        <Button
          id="mobile-navigation-button"
          startIcon={<MenuRoundedIcon />}
          variant="contained"
          disableElevation
          onClick={(event) => setMenuAnchor(event.currentTarget)}
          aria-label={t.common.openNavigationMenu}
          aria-haspopup="dialog"
          aria-expanded={isMenuOpen}
          aria-controls={isMenuOpen ? "mobile-navigation-panel" : undefined}
          sx={{
            display: { xs: "inline-flex", lg: "none" },
            flexShrink: 0,
            minHeight: 44,
            px: 1.5,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 800,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            "&:hover": {
              bgcolor: "primary.dark",
            },
          }}
        >
          {t.common.navigationMenu}
        </Button>

        <Popover
          open={isMenuOpen}
          anchorEl={menuAnchor}
          onClose={closeMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          slotProps={{
            paper: {
              id: "mobile-navigation-panel",
              role: "dialog",
              "aria-modal": true,
              "aria-label": t.common.openNavigationMenu,
              tabIndex: -1,
              sx: {
                width: 380,
                maxWidth: "calc(100vw - 32px)",
                p: 2,
                borderRadius: 4,
                border: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
                backgroundImage: "none",
              },
            },
          }}
        >
          <Stack
            spacing={2}
            sx={{
              "& .MuiButton-root": {
                minHeight: 44,
              },
              "& .MuiChip-root": {
                width: "100%",
                minHeight: 44,
                height: "auto",
                typography: "button",
                textTransform: "none",
                fontWeight: 800,
              },
              "& .MuiChip-label": {
                whiteSpace: "normal",
                overflowWrap: "anywhere",
                py: 1,
              },
            }}
          >
            <Stack
              direction="row"
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Typography
                variant="button"
                component="p"
                sx={{ fontWeight: 800, textTransform: "none" }}
              >
                {t.common.navigationMenu}
              </Typography>
              <IconButton
                onClick={closeMenu}
                aria-label={t.common.closeNavigationMenu}
                sx={{
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  color: "text.secondary",
                }}
              >
                <CloseRoundedIcon />
              </IconButton>
            </Stack>

            {!isLoading && user && (
              <Button
                onClick={() => navigateFromMenu("/profile")}
                startIcon={<PersonOutlineOutlinedIcon />}
                endIcon={<ChevronRightRoundedIcon />}
                aria-current={pathname === "/profile" ? "page" : undefined}
                sx={{
                  width: "100%",
                  minWidth: 0,
                  justifyContent: "flex-start",
                  textAlign: "left",
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 800,
                  color: "text.primary",
                  bgcolor: "action.hover",
                  border: 1,
                  borderColor:
                    pathname === "/profile" ? "primary.main" : "divider",
                  px: 1.25,
                  py: 1,
                  "&:hover": {
                    bgcolor: "action.selected",
                    borderColor: "primary.main",
                  },
                  "& .MuiButton-startIcon, & .MuiButton-endIcon": {
                    color: "primary.main",
                  },
                  "& .MuiButton-endIcon": {
                    ml: 1,
                    mr: 0,
                  },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    overflowWrap: "anywhere",
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user.name} ·{" "}
                    {user.role === "teacher"
                      ? t.auth.teacherRole
                      : t.auth.studentRole}
                  </Box>
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.25,
                      fontWeight: 700,
                      color: "primary.main",
                    }}
                  >
                    {t.common.viewProfile}
                  </Typography>
                </Box>
              </Button>
            )}

            <Divider />

            <Stack spacing={1}>
              <Button
                onClick={() => navigateFromMenu("/student")}
                sx={navButtonSx(isStudentPage)}
              >
                {t.common.student}
              </Button>

              <Button
                onClick={() => navigateFromMenu("/teacher")}
                sx={navButtonSx(isTeacherPage)}
              >
                {t.common.teacher}
              </Button>
            </Stack>

            <Divider />

            <Button
              onClick={toggleColorMode}
              startIcon={
                mode === "light" ? <DarkModeIcon /> : <LightModeIcon />
              }
              sx={navButtonSx(false)}
            >
              {mode === "light"
                ? t.common.switchToDarkMode
                : t.common.switchToLightMode}
            </Button>

            <Box>
              <Typography
                variant="button"
                component="p"
                sx={{
                  mb: 1,
                  fontWeight: 800,
                  textAlign: "center",
                  textTransform: "none",
                  color: "text.primary",
                }}
              >
                {t.common.languageLabel}
              </Typography>

              <Box
                role="group"
                aria-label={t.common.languageLabel}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 1,
                }}
              >
                <Button
                  fullWidth
                  onClick={() => setLanguage("sv")}
                  aria-label={t.common.switchToSwedish}
                  aria-pressed={language === "sv"}
                  sx={navButtonSx(language === "sv")}
                >
                  SV
                </Button>

                <Button
                  fullWidth
                  onClick={() => setLanguage("en")}
                  aria-label={t.common.switchToEnglish}
                  aria-pressed={language === "en"}
                  sx={navButtonSx(language === "en")}
                >
                  EN
                </Button>
              </Box>
            </Box>

            <Divider />

            <HeaderAuthActions
              mobile
              showProfile={false}
              onNavigate={closeMenu}
            />
          </Stack>
        </Popover>
      </Toolbar>
    </AppBar>
  );
}
