import { Suspense } from "react";

import { Box, Container } from "@mui/material";

import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import AppHeader from "@/components/layout/AppHeader";

export default function ResetPasswordPage() {
  return (
    <>
      <AppHeader />

      <Container sx={{ py: { xs: 4, md: 8 } }}>
        <Box
          sx={{
            minHeight: "calc(100vh - 180px)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </Box>
      </Container>
    </>
  );
}
