"use client";

import { AppBar, Button, Stack, Toolbar, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/useTranslations";

export default function AppHeader() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslations();

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

          <Button
            color="inherit"
            onClick={() => setLanguage(language === "sv" ? "en" : "sv")}
          >
            {language === "sv" ? "EN" : "SV"}
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
