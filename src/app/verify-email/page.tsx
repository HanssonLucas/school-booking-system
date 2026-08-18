"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "@/i18n/useTranslations";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import AppHeader from "@/components/layout/AppHeader";
type VerificationStatus = "loading" | "success" | "error";

type VerifyEmailResponse = {
  verified?: boolean;
  error?: string;
};

type VerificationErrorKey = "expiredToken" | "invalidToken" | "fallbackError";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { t } = useTranslations();

  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [error, setError] = useState<VerificationErrorKey | null>(null);

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
            setError("expiredToken");
          } else {
            setError("invalidToken");
          }

          setStatus("error");
          return;
        }

        setStatus("success");
      } catch {
        setError("fallbackError");
        setStatus("error");
      }
    };

    void verifyEmail();
  }, [token]);

  const displayStatus: VerificationStatus = token ? status : "error";

  const displayError = token
    ? error
      ? t.verifyEmail[error]
      : null
    : t.verifyEmail.missingToken;

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
                  {t.verifyEmail.verifying}
                </Typography>
              </>
            )}

            {displayStatus === "success" && (
              <Stack
                spacing={2.5}
                sx={{
                  width: "100%",
                  alignItems: "center",
                  textAlign: "center",
                  py: { xs: 2, sm: 3 },
                }}
              >
                <Box
                  sx={{
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "success.main",
                    color: "success.contrastText",
                    boxShadow: 3,
                  }}
                >
                  <CheckCircleOutlineRoundedIcon sx={{ fontSize: 52 }} />
                </Box>

                <Box>
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      fontWeight: 900,
                      letterSpacing: -0.7,
                    }}
                  >
                    {t.verifyEmail.successTitle}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 1.5,
                      fontSize: { xs: "1rem", sm: "1.05rem" },
                      lineHeight: 1.7,
                    }}
                  >
                    {t.verifyEmail.successMessage}
                  </Typography>
                </Box>
              </Stack>
            )}

            {displayStatus === "error" && (
              <>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  {t.verifyEmail.errorTitle}
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
