"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, Chip, Stack } from "@mui/material";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import type { AuthUser } from "@/types/auth";
import { useTranslations } from "@/i18n/useTranslations";

type MeResponse = {
  user: AuthUser | null;
};

export default function HeaderAuthActions() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslations();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = (await response.json()) as MeResponse;

        if (isMounted) {
          setUser(data.user);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      setUser(null);
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
        sx={{
          borderRadius: 999,
          fontWeight: 800,
          bgcolor: "action.hover",
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
