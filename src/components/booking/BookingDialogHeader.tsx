"use client";

import { Box, IconButton, Stack, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useTranslations } from "@/i18n/useTranslations";

type BookingDialogHeaderProps = {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  onClose: () => void;
};

export default function BookingDialogHeader({
  id,
  eyebrow,
  title,
  description,
  onClose,
}: BookingDialogHeaderProps) {
  const { t } = useTranslations();

  return (
    <Box
      sx={{
        position: "relative",
        isolation: "isolate",
        px: { xs: 3, sm: 4 },
        pt: 3,
        pb: 2.5,
        flexShrink: 0,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          zIndex: -1,
          background:
            "linear-gradient(180deg, currentColor 0%, transparent 100%)",
          color: "primary.main",
          opacity: 0.045,
          pointerEvents: "none",
        },
      }}
    >
      <Stack
        direction="row"
        spacing={2}
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
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.1,
              lineHeight: 1.5,
            }}
          >
            {eyebrow}
          </Typography>

          <Typography
            id={id}
            component="h2"
            sx={{
              mt: 0.75,
              fontSize: { xs: "1.4rem", sm: "1.625rem" },
              fontWeight: 700,
              letterSpacing: -0.4,
              lineHeight: 1.3,
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
                mt: 1,
                lineHeight: 1.7,
                overflowWrap: "anywhere",
              }}
            >
              {description}
            </Typography>
          )}
        </Box>

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
      </Stack>
    </Box>
  );
}
