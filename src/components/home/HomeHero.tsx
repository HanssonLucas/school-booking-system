"use client";

import Link from "next/link";
import { Box, Button, Chip, Skeleton, Stack, Typography } from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useAuth } from "@/components/auth/useAuth";
import { useTranslations } from "@/i18n/useTranslations";

const buttonSx = {
  borderRadius: 999,
  textTransform: "none",
  fontWeight: 800,
  px: 3,
  py: 1.4,
};

export default function HomeHero() {
  const { user, isLoading } = useAuth();
  const { t } = useTranslations();

  return (
    <Box
      component="section"
      aria-labelledby="home-hero-title"
      sx={{
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        borderRadius: 6,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        px: { xs: 3, sm: 5, md: 8 },
        py: { xs: 5, sm: 7, md: 9 },
        mb: 5,
        textAlign: "center",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
          bgcolor: "primary.main",
          opacity: 0.06,
          maskImage: "linear-gradient(to bottom, black, transparent)",
        },
      }}
    >
      <Stack spacing={3} sx={{ alignItems: "center", mx: "auto" }}>
        <Chip
          icon={<SchoolOutlinedIcon />}
          label={t.home.hero.eyebrow}
          variant="outlined"
          color="primary"
          sx={{
            maxWidth: "100%",
            fontWeight: 700,
            bgcolor: "background.paper",
          }}
        />

        <Typography
          id="home-hero-title"
          component="h1"
          sx={{
            maxWidth: 900,
            fontWeight: 900,
            fontSize: { xs: "2.25rem", sm: "3.25rem", md: "4.25rem" },
            lineHeight: 1.12,
            letterSpacing: { xs: "-0.8px", md: "-2px" },
            textWrap: "balance",
          }}
        >
          {t.home.hero.title}
          <Box
            component="span"
            sx={{ display: "block", color: "primary.main" }}
          >
            {t.home.hero.titleAccent}
          </Box>
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            maxWidth: 640,
            fontSize: { xs: "1rem", sm: "1.125rem" },
            lineHeight: 1.8,
          }}
        >
          {t.home.hero.description}
        </Typography>

        <Box sx={{ pt: 1, minHeight: 56, width: { xs: "100%", sm: "auto" } }}>
          {isLoading ? (
            <Skeleton
              variant="rounded"
              width={240}
              height={52}
              sx={{ borderRadius: 999, mx: "auto" }}
            />
          ) : user ? (
            <Button
              component={Link}
              href={user.role === "teacher" ? "/teacher" : "/student"}
              variant="contained"
              color="primary"
              size="large"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={buttonSx}
            >
              {t.home.hero.overviewButton}
            </Button>
          ) : (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                component={Link}
                href="/register"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<PersonAddOutlinedIcon />}
                sx={buttonSx}
              >
                {t.auth.registerButton}
              </Button>

              <Button
                component={Link}
                href="/login"
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<LoginOutlinedIcon />}
                sx={buttonSx}
              >
                {t.auth.loginButton}
              </Button>
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
