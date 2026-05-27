"use client";

import { AppBar, Button, Stack, Toolbar, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/useTranslations";
import IconButton from "@mui/material/IconButton";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useAppTheme } from "@/theme/AppThemeProvider";

export default function AppHeader() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslations();
  const { mode, toggleColorMode } = useAppTheme();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="button"
          onClick={() => router.push("/")}
          sx={{
            flexGrow: 1,
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            textAlign: "left",
            font: "inherit",
          }}
        >
          {t.common.appName}
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button color="inherit" onClick={() => router.push("/student")}>
            {t.common.student}
          </Button>

          <Button color="inherit" onClick={() => router.push("/teacher")}>
            {t.common.teacher}
          </Button>
          <IconButton
            color="inherit"
            onClick={toggleColorMode}
            aria-label={
              mode === "light"
                ? t.common.switchToDarkMode
                : t.common.switchToLightMode
            }
          >
            {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>

          <Button
            color="inherit"
            aria-label={
              language === "sv"
                ? t.common.switchToEnglish
                : t.common.switchToSwedish
            }
            onClick={() => setLanguage(language === "sv" ? "en" : "sv")}
          >
            {language === "sv" ? "EN" : "SV"}
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
