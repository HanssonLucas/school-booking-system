import type { ReactNode } from "react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useTranslations } from "@/i18n/useTranslations";

type SessionDialogHeaderProps = {
  title: string;
  description?: string;
  icon: ReactNode;
  onClose?: () => void;
};

export default function SessionDialogHeader({
  title,
  description,
  icon,
  onClose,
}: SessionDialogHeaderProps) {
  const { t } = useTranslations();

  return (
    <Box
      sx={{
        px: { xs: 2.5, sm: 3 },
        py: 2.5,
        position: "relative",
        isolation: "isolate",
        borderBottom: 1,
        borderColor: "divider",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          zIndex: -1,
          bgcolor: "primary.main",
          opacity: 0.06,
          pointerEvents: "none",
        },
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            display: "grid",
            placeItems: "center",
            color: "primary.main",
            flexShrink: 0,
            position: "relative",
            isolation: "isolate",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              zIndex: -1,
              borderRadius: "inherit",
              bgcolor: "primary.main",
              opacity: 0.12,
              pointerEvents: "none",
            },
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 900,
              letterSpacing: -0.4,
              overflowWrap: "anywhere",
            }}
          >
            {title}
          </Typography>

          {description && (
            <Typography
              color="text.secondary"
              sx={{ mt: 0.5, overflowWrap: "anywhere" }}
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
              alignSelf: "flex-start",
              color: "text.secondary",
              "&:hover": {
                bgcolor: "action.hover",
                color: "text.primary",
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
