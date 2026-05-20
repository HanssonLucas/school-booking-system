"use client";

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";

type UserRole = "student" | "teacher";

type RoleSelectionDialogProps = {
  open: boolean;
  onSelectRole: (role: UserRole) => void;
};

export default function RoleSelectionDialog({
  open,
  onSelectRole,
}: RoleSelectionDialogProps) {
  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
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
          },
        },
      }}
    >
      <DialogContent>
        <Box sx={{ textAlign: "center", mb: 4 }}>
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
            Välj om du vill fortsätta som student eller lärare. I den första
            versionen används detta för att visa rätt vy i systemet.
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
      </DialogContent>
    </Dialog>
  );
}
