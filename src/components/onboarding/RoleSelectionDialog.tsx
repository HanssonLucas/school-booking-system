"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

type RoleSelectionDialogProps = {
  open: boolean;
  onSelectRole: (role: "student" | "teacher") => void;
};

export default function RoleSelectionDialog({
  open,
  onSelectRole,
}: RoleSelectionDialogProps) {
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Välj hur du vill använda systemet</DialogTitle>

      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Välj om du vill gå vidare som student eller lärare. Detta används bara
          för att visa rätt vy i den första versionen av systemet.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => onSelectRole("student")}
          >
            Jag är student
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => onSelectRole("teacher")}
          >
            Jag är lärare
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
