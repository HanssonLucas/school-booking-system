"use client";

import { Container } from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";
import HomeHero from "@/components/home/HomeHero";
import HomeGettingStarted from "@/components/home/HomeGettingStarted";
import HomeBookingPreview from "@/components/home/HomeBookingPreview";

export default function HomePage() {
  return (
    <>
      <AppHeader />

      <Container sx={{ py: { xs: 4, md: 7 } }}>
        <HomeHero />
        <HomeGettingStarted />
        <HomeBookingPreview />
      </Container>
    </>
  );
}
