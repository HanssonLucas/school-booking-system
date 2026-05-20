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
        aria-label="Stäng dialog"
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
            Välkommen
          </Typography>

          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, mt: 1 }}
          >
            Hur vill du använda systemet?
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Välj om du vill fortsätta som student eller lärare. Du kan också
            stänga detta och bara titta på översikten.
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
            Jag är student
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
            Jag är lärare
          </Button>
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button onClick={onClose} sx={{ textTransform: "none" }}>
            Stäng och visa översikt
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
