"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";
type VerificationStatus = "loading" | "success" | "error";

type VerifyEmailResponse = {
  verified?: boolean;
  error?: string;
};

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = (await response.json()) as VerifyEmailResponse;

        if (!response.ok) {
          if (data.error === "EXPIRED_VERIFICATION_TOKEN") {
            setError("Verifieringslänken har gått ut.");
          } else {
            setError("Verifieringslänken är ogiltig eller har redan använts.");
          }

          setStatus("error");
          return;
        }

        setStatus("success");
      } catch {
        setError("Något gick fel när e-postadressen skulle verifieras.");
        setStatus("error");
      }
    };

    void verifyEmail();
  }, [token]);

  const displayStatus: VerificationStatus = token ? status : "error";

  const displayError = token
    ? error
    : "Verifieringslänken saknar en giltig token.";

  return (
    <>
      <AppHeader />

      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 7 } }}>
        <Paper
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 5,
            border: 1,
            borderColor: "divider",
            boxShadow: 3,
          }}
        >
          <Stack spacing={3} sx={{ alignItems: "center", textAlign: "center" }}>
            {displayStatus === "loading" && (
              <>
                <CircularProgress />

                <Typography variant="h5" sx={{ fontWeight: 850 }}>
                  Verifierar din e-postadress...
                </Typography>
              </>
            )}

            {displayStatus === "success" && (
              <>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  E-postadressen är verifierad
                </Typography>

                <Alert severity="success" sx={{ width: "100%" }}>
                  Din e-postadress har verifierats.
                </Alert>
              </>
            )}

            {displayStatus === "error" && (
              <>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  Verifieringen misslyckades
                </Typography>

                <Alert severity="error" sx={{ width: "100%" }}>
                  {displayError}
                </Alert>
              </>
            )}
          </Stack>
        </Paper>
      </Container>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
