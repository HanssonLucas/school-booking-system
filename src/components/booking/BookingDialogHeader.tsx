"use client";

import { Box, IconButton, Stack, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useTranslations } from "@/i18n/useTranslations";

type BookingDialogHeaderProps = {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  onClose?: () => void;
  compact?: boolean;
};

export default function BookingDialogHeader({
  id,
  eyebrow,
  title,
  description,
  onClose,
  compact = false,
}: BookingDialogHeaderProps) {
  const { t } = useTranslations();

  return (
    <Box
      sx={{
        position: "relative",
        isolation: "isolate",
        flexShrink: 0,
        px: { xs: 2.5, sm: 4 },
        pt: compact ? 3 : { xs: 3, sm: 4 },
        pb: 1,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          zIndex: -1,
          background:
            "linear-gradient(180deg, currentColor 0%, transparent 100%)",
          color: "primary.main",
          opacity: 0.09,
          pointerEvents: "none",
        },
      }}
    >
      <Stack
        direction="row"
        spacing={{ xs: 1, sm: 2 }}
        sx={{
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="p"
            sx={{
              color: "primary.main",
              fontSize: "0.72rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 1.3,
              lineHeight: 1.5,
            }}
          >
            {eyebrow}
          </Typography>

          <Typography
            id={id}
            component="h2"
            sx={{
              mt: 1,
              fontSize: compact
                ? { xs: "1.5rem", sm: "1.75rem" }
                : { xs: "1.625rem", sm: "2rem" },
              fontWeight: 800,
              letterSpacing: -0.6,
              lineHeight: 1.2,
              overflowWrap: "anywhere",
            }}
          >
            {title}
          </Typography>

          {description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1.25,
                maxWidth: "60ch",
                lineHeight: 1.65,
                overflowWrap: "anywhere",
              }}
            >
              {description}
            </Typography>
          )}
        </Box>

        {onClose && (
          <IconButton
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
                bgcolor: "action.hover",
              },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        )}
      </Stack>
    </Box>
  );
}
