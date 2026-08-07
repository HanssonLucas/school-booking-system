import { Box, Container } from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
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
          <RegisterForm />
        </Box>
      </Container>
    </>
  );
}
