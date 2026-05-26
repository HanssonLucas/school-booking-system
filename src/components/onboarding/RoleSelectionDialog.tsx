"use client";

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SchoolIcon from "@mui/icons-material/School";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import { useTranslations } from "@/i18n/useTranslations";

type UserRole = "student" | "teacher";

type RoleSelectionDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelectRole: (role: UserRole) => void;
};

export default function RoleSelectionDialog({
  open,
  onClose,
  onSelectRole,
}: RoleSelectionDialogProps) {
  const { t } = useTranslations();

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(4px)",
          },
        },
        paper: {
          sx: {
            borderRadius: 4,
            p: { xs: 1, sm: 2 },
            position: "relative",
          },
        },
      }}
    >
      <IconButton
        aria-label={t.onboarding.closeDialog}
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent>
        <Box sx={{ textAlign: "center", mb: 4, pt: 3 }}>
          <Typography variant="overline" color="primary">
            {t.onboarding.welcome}
          </Typography>

          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, mt: 1 }}
          >
            {t.onboarding.title}
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 2 }}>
            {t.onboarding.description}
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<SchoolIcon />}
            onClick={() => onSelectRole("student")}
            sx={{
              py: 2,
              borderRadius: 3,
              textTransform: "none",
              fontSize: "1rem",
            }}
          >
            {t.onboarding.studentButton}
          </Button>

          <Button
            variant="outlined"
            size="large"
            fullWidth
            startIcon={<EditCalendarIcon />}
            onClick={() => onSelectRole("teacher")}
            sx={{
              py: 2,
              borderRadius: 3,
              textTransform: "none",
              fontSize: "1rem",
            }}
          >
            {t.onboarding.teacherButton}
          </Button>
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button onClick={onClose} sx={{ textTransform: "none" }}>
            {t.onboarding.closeAndViewOverview}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
