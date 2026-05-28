"use client";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { useTranslations } from "@/i18n/useTranslations";

type DeleteBookingSessionDialogProps = {
  open: boolean;
  sessionTitle?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteBookingSessionDialog({
  open,
  sessionTitle,
  onClose,
  onConfirm,
}: DeleteBookingSessionDialogProps) {
  const { t } = useTranslations();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 5,
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
          },
        },
      }}
    >
      <Box
        sx={{
          p: { xs: 3, sm: 4 },
          pb: 2,
          background:
            "linear-gradient(135deg, rgba(211, 47, 47, 0.14), rgba(255, 152, 0, 0.08))",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 4,
              display: "grid",
              placeItems: "center",
              bgcolor: "error.main",
              color: "error.contrastText",
              boxShadow: 3,
              flexShrink: 0,
            }}
          >
            <DeleteOutlineOutlinedIcon />
          </Box>

          <Box>
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 900, letterSpacing: -0.4 }}
            >
              {t.deleteSessionDialog.title}
            </Typography>

            {sessionTitle && (
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {sessionTitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={3}>
          <Alert
            severity="warning"
            icon={<WarningAmberOutlinedIcon />}
            sx={{ borderRadius: 3 }}
          >
            {t.deleteSessionDialog.descriptionStart}{" "}
            <Box component="span" sx={{ fontWeight: 900 }}>
              {sessionTitle}
            </Box>
            ? {t.deleteSessionDialog.descriptionEnd}
          </Alert>

          <DialogActions
            sx={{
              px: 0,
              pt: 1,
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={onClose}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                px: 2.5,
              }}
            >
              {t.deleteSessionDialog.cancelButton}
            </Button>

            <Button
              color="error"
              variant="contained"
              onClick={onConfirm}
              startIcon={<DeleteOutlineOutlinedIcon />}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                px: 3,
                py: 1.1,
              }}
            >
              {t.deleteSessionDialog.deleteButton}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
