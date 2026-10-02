"use client";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/useAuth";
import { useTranslations } from "@/i18n/useTranslations";
import SessionDialogHeader from "@/components/booking/SessionDialogHeader";

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
  const router = useRouter();
  const { user: currentUser } = useAuth();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            backgroundImage: "none",
            maxWidth: 600,
          },
        },
      }}
    >
      <SessionDialogHeader
        title={t.deleteSessionDialog.title}
        description={sessionTitle}
        icon={<DeleteOutlineOutlinedIcon />}
        onClose={onClose}
      />

      <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
        {currentUser && !currentUser.emailVerified ? (
          <Stack spacing={3}>
            <Alert severity="warning" sx={{ borderRadius: 3 }}>
              {t.auth.teacherEmailVerificationRequired}
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
                variant="contained"
                startIcon={<PersonOutlineOutlinedIcon />}
                onClick={() => router.push("/profile")}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                  px: 2.5,
                }}
              >
                {t.profile.title}
              </Button>
            </DialogActions>
          </Stack>
        ) : (
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
        )}
      </DialogContent>
    </Dialog>
  );
}
