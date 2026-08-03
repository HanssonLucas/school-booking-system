"use client";

import {
  AppBar,
  Box,
  Button,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/useTranslations";
import { useAppTheme } from "@/theme/AppThemeProvider";
import HeaderAuthActions from "@/components/auth/HeaderAuthActions";

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const { t, language, setLanguage } = useTranslations();
  const { mode, toggleColorMode } = useAppTheme();

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
        }}
      >
        <Box
          component="button"
          onClick={() => router.push("/")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexGrow: 1,
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
      </Toolbar>
    </AppBar>
  );
}
