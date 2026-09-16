"use client";

import type { ReactNode } from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useTranslations } from "@/i18n/useTranslations";

type Step = {
  title: string;
  description: string;
};

type GettingStartedCardProps = {
  title: string;
  icon: ReactNode;
  steps: readonly Step[];
};

function GettingStartedCard({ title, icon, steps }: GettingStartedCardProps) {
  return (
    <Card
      sx={{
        flex: 1,
        minWidth: 0,
        borderRadius: 5,
        border: 1,
        borderColor: "divider",
        boxShadow: 2,
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 4 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              borderRadius: 4,
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              boxShadow: 2,
            }}
          >
            {icon}
          </Box>

          <Typography variant="h5" component="h3" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
        </Stack>

        <Stack
          component="ol"
          spacing={3}
          sx={{ m: 0, p: 0, listStyle: "none" }}
        >
          {steps.map((step, index) => (
            <Stack
              component="li"
              key={step.title}
              direction="row"
              spacing={2}
              sx={{ alignItems: "flex-start" }}
            >
              <Box
                aria-hidden="true"
                sx={{
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "action.hover",
                  color: "primary.main",
                  border: 1,
                  borderColor: "divider",
                  fontWeight: 800,
                }}
              >
                {index + 1}
              </Box>

              <Box>
                <Typography component="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {step.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.7 }}
                >
                  {step.description}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function HomeGettingStarted() {
  const { t } = useTranslations();
  const content = t.home.gettingStarted;

  return (
    <Box
      id="getting-started"
      component="section"
      aria-labelledby="getting-started-title"
      sx={{ scrollMarginTop: 104 }}
    >
      <Box sx={{ mb: 3, maxWidth: 720 }}>
        <Typography
          id="getting-started-title"
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 850,
            letterSpacing: -0.5,
            fontSize: { xs: "1.75rem", md: "2.125rem" },
          }}
          gutterBottom
        >
          {content.title}
        </Typography>

        <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
          {content.description}
        </Typography>
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        <GettingStartedCard
          title={content.student.title}
          icon={<SchoolOutlinedIcon />}
          steps={content.student.steps}
        />

        <GettingStartedCard
          title={content.teacher.title}
          icon={<EditCalendarOutlinedIcon />}
          steps={content.teacher.steps}
        />
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "flex-start", mt: 2 }}
      >
        <LockOutlinedIcon
          sx={{ fontSize: 18, color: "text.secondary", mt: 0.25 }}
        />

        <Typography variant="body2" color="text.secondary">
          {content.teacherCodeNotice}
        </Typography>
      </Stack>
    </Box>
  );
}
