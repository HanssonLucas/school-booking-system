"use client";

import { useId, type ReactNode } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import BookingDialogHeader from "@/components/booking/BookingDialogHeader";
import { useTranslations } from "@/i18n/useTranslations";

type HowItWorksDialogProps = {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  description?: string;
  items: {
    id: string;
    icon: ReactNode;
    title: string;
    description: string;
  }[];
};

export default function HowItWorksDialog({
  open,
  onClose,
  eyebrow,
  title,
  description,
  items,
}: HowItWorksDialogProps) {
  const { t } = useTranslations();
  const id = useId();
  const headingId = `${id}-heading`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
      aria-labelledby={headingId}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            backgroundImage: "none",
          },
        },
      }}
    >
      <BookingDialogHeader
        id={headingId}
        eyebrow={eyebrow}
        title={title}
        description={description}
        onClose={onClose}
      />

      <DialogContent sx={{ px: { xs: 2.5, sm: 4 }, py: 2.5 }}>
        <Stack
          component="ul"
          spacing={3}
          sx={{ listStyle: "none", m: 0, p: 0 }}
        >
          {items.map((item) => (
            <Stack
              component="li"
              direction="row"
              spacing={2}
              key={item.id}
              sx={{ alignItems: "flex-start" }}
            >
              <Box
                aria-hidden="true"
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "action.hover",
                  color: "primary.main",
                }}
              >
                {item.icon}
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  component="h3"
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    mb: 0.5,
                    overflowWrap: "anywhere",
                  }}
                >
                  {item.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.7, overflowWrap: "anywhere" }}
                >
                  {item.description}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 4 },
          pb: 3,
          pt: 1,
        }}
      >
        <Button
          autoFocus
          onClick={onClose}
          variant="contained"
          disableElevation
          sx={{
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 800,
            px: 2.5,
          }}
        >
          {t.common.close}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
