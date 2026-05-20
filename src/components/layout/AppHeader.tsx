"use client";

import { AppBar, Button, Stack, Toolbar, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function AppHeader() {
  const router = useRouter();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="button"
          onClick={() => router.push("/")}
          sx={{
            flexGrow: 1,
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            textAlign: "left",
            font: "inherit",
          }}
        >
          Bokningssystem
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button color="inherit" onClick={() => router.push("/student")}>
            Student
          </Button>

          <Button color="inherit" onClick={() => router.push("/teacher")}>
            Lärare
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
