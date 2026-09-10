"use client";

import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";

type Props = {
  id: string;
  title: string;
  description?: string;
  icon: ReactNode;
};

export const classButtonSx = {
  borderRadius: 999,
  textTransform: "none",
  fontWeight: 800,
  px: 2.5,
} as const;

export const classDialogPaperSx = {
  borderRadius: 5,
  overflow: "hidden",
  border: 1,
  borderColor: "divider",
} as const;

export default function ClassDialogHeader({
  id,
  title,
  description,
  icon,
}: Props) {
  return (
    <Box
      sx={{
        p: { xs: 3, sm: 4 },
        pb: 2,
        background:
          "linear-gradient(135deg, rgba(25, 118, 210, 0.14), rgba(76, 175, 80, 0.08))",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 4,
            display: "grid",
            placeItems: "center",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            boxShadow: 3,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            id={id}
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
      </Stack>
    </Box>
  );
}
