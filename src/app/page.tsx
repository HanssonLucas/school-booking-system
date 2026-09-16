"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AppHeader from "@/components/layout/AppHeader";
import HomeHero from "@/components/home/HomeHero";
import HomeBookingPreview from "@/components/home/HomeBookingPreview";
import { useTranslations } from "@/i18n/useTranslations";

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslations();

  const handleSelectRole = (role: "student" | "teacher") => {
    router.push(`/${role}`);
  };

  return (
    <>
      <AppHeader />

      <Container sx={{ py: { xs: 4, md: 7 } }}>
        <HomeHero />

        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Card
            sx={{
              flex: 1,
              borderRadius: 5,
              border: 1,
              borderColor: "divider",
              boxShadow: 2,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 4,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  mb: 3,
                  boxShadow: 3,
                }}
              >
                <SchoolOutlinedIcon />
              </Box>

              <Typography
                variant="h5"
                component="h2"
                sx={{ fontWeight: 800, mb: 1 }}
              >
                {t.common.student}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ lineHeight: 1.7, mb: 3 }}
              >
                {t.home.studentCardDescription}
              </Typography>

              <Button
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => handleSelectRole("student")}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                {t.home.goToStudentView}
              </Button>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              borderRadius: 5,
              border: 1,
              borderColor: "divider",
              boxShadow: 2,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 4,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "secondary.main",
                  color: "secondary.contrastText",
                  mb: 3,
                  boxShadow: 3,
                }}
              >
                <EditCalendarOutlinedIcon />
              </Box>

              <Typography
                variant="h5"
                component="h2"
                sx={{ fontWeight: 800, mb: 1 }}
              >
                {t.common.teacher}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ lineHeight: 1.7, mb: 3 }}
              >
                {t.home.teacherCardDescription}
              </Typography>

              <Button
                variant="outlined"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => handleSelectRole("teacher")}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                {t.home.goToTeacherView}
              </Button>
            </CardContent>
          </Card>
        </Stack>

        <HomeBookingPreview />
      </Container>
    </>
  );
}
