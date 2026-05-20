import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";

export default function AppHeader() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Bokningssystem
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button color="inherit">Student</Button>
          <Button color="inherit">Lärare</Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
