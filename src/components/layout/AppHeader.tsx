"use client";

import {
  AppBar,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/useTranslations";
import { useAppTheme } from "@/theme/AppThemeProvider";

export default function AppHeader() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslations();
  const { mode, toggleColorMode } = useAppTheme();

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
              width: 40,
              height: 40,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              boxShadow: 3,
              flexShrink: 0,
            }}
          >
            <CalendarMonthOutlinedIcon />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: -0.4,
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
              {language === "sv"
                ? "Planera och boka tider"
                : "Plan and book times"}
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
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              px: 2,
              color: "text.primary",
              bgcolor: "action.hover",
              "&:hover": {
                bgcolor: "action.selected",
              },
            }}
          >
            {t.common.student}
          </Button>

          <Button
            onClick={() => router.push("/teacher")}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              px: 2,
              color: "text.primary",
              bgcolor: "action.hover",
              "&:hover": {
                bgcolor: "action.selected",
              },
            }}
          >
            {t.common.teacher}
          </Button>

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

          <Chip
            clickable
            label={language === "sv" ? "EN" : "SV"}
            aria-label={
              language === "sv"
                ? t.common.switchToEnglish
                : t.common.switchToSwedish
            }
            onClick={() => setLanguage(language === "sv" ? "en" : "sv")}
            sx={{
              height: 40,
              borderRadius: 999,
              fontWeight: 800,
              px: 0.75,
              bgcolor: "action.hover",
              "&:hover": {
                bgcolor: "action.selected",
              },
            }}
          />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
