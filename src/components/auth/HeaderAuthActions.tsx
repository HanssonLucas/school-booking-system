"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, Chip, Stack } from "@mui/material";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useTranslations } from "@/i18n/useTranslations";
import { useAuth } from "@/components/auth/useAuth";

export default function HeaderAuthActions() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslations();

  const { user, isLoading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();

      router.push("/");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const authButtonSx = (isActive: boolean) => ({
    borderRadius: 999,
    textTransform: "none",
    fontWeight: 800,
    px: 2,
    color: isActive ? "primary.contrastText" : "text.primary",
    bgcolor: isActive ? "primary.main" : "action.hover",
    boxShadow: isActive ? 3 : 0,
    "&:hover": {
      bgcolor: isActive ? "primary.dark" : "action.selected",
    },
  });

  if (isLoading) {
    return null;
  }

  if (!user) {
    return (
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Button
          onClick={() => router.push("/login")}
          sx={authButtonSx(pathname === "/login")}
        >
          {t.auth.loginButton}
        </Button>

        <Button
          onClick={() => router.push("/register")}
          sx={authButtonSx(pathname === "/register")}
        >
          {t.auth.registerButton}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <Chip
        icon={<PersonOutlineOutlinedIcon />}
        label={`${user.name} · ${
          user.role === "teacher" ? t.auth.teacherRole : t.auth.studentRole
        }`}
        onClick={() => router.push("/profile")}
        sx={{
          borderRadius: 999,
          fontWeight: 800,
          cursor: "pointer",
          color:
            pathname === "/profile" ? "primary.contrastText" : "text.primary",
          bgcolor: pathname === "/profile" ? "primary.main" : "action.hover",
          boxShadow: pathname === "/profile" ? 3 : 0,
          "&:hover": {
            bgcolor:
              pathname === "/profile" ? "primary.dark" : "action.selected",
          },
        }}
      />

      <Button
        onClick={handleLogout}
        disabled={isLoggingOut}
        startIcon={<LogoutOutlinedIcon />}
        sx={authButtonSx(false)}
      >
        {t.auth.logoutButton}
      </Button>
    </Stack>
  );
}
