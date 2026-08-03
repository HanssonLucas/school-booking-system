import { Box, Container } from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
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
          <LoginForm />
        </Box>
      </Container>
    </>
  );
}
