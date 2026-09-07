"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, Chip, Stack } from "@mui/material";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useTranslations } from "@/i18n/useTranslations";
import { useAuth } from "@/components/auth/useAuth";

type HeaderAuthActionsProps = {
  mobile?: boolean;
  showProfile?: boolean;
  onNavigate?: () => void;
};

export default function HeaderAuthActions({
  mobile = false,
  showProfile = true,
  onNavigate,
}: HeaderAuthActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslations();
  const { user, isLoading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigateTo = (path: string) => {
    onNavigate?.();
    router.push(path);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      onNavigate?.();
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
      <Stack
        direction={mobile ? "column" : "row"}
        spacing={1}
        sx={{
          alignItems: mobile ? "stretch" : "center",
          width: mobile ? "100%" : "auto",
          minWidth: 0,
        }}
      >
        <Button
          onClick={() => navigateTo("/login")}
          sx={authButtonSx(pathname === "/login")}
        >
          {t.auth.loginButton}
        </Button>
        <Button
          onClick={() => navigateTo("/register")}
          sx={authButtonSx(pathname === "/register")}
        >
          {t.auth.registerButton}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack
      direction={mobile ? "column" : "row"}
      spacing={1}
      sx={{
        alignItems: mobile ? "stretch" : "center",
        width: mobile ? "100%" : "auto",
        minWidth: 0,
      }}
    >
      {showProfile && (
        <Chip
          icon={<PersonOutlineOutlinedIcon />}
          label={`${user.name} · ${
            user.role === "teacher" ? t.auth.teacherRole : t.auth.studentRole
          }`}
          onClick={() => navigateTo("/profile")}
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
      )}

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
