"use client";

import { useState } from "react";

import { IconButton, InputAdornment, TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

import { useTranslations } from "@/i18n/useTranslations";

type PasswordFieldProps = Omit<
  TextFieldProps,
  "type" | "multiline" | "select" | "slots" | "slotProps"
> & {
  showLabel?: string;
  hideLabel?: string;
};

export default function PasswordField({
  disabled,
  showLabel,
  hideLabel,
  ...props
}: PasswordFieldProps) {
  const { t } = useTranslations();
  const [showPassword, setShowPassword] = useState(false);

  const visibilityLabel = showPassword
    ? (hideLabel ?? t.auth.hidePassword)
    : (showLabel ?? t.auth.showPassword);

  return (
    <TextField
      {...props}
      disabled={disabled}
      type={showPassword ? "text" : "password"}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                type="button"
                aria-label={visibilityLabel}
                title={visibilityLabel}
                disabled={disabled}
                onClick={() => setShowPassword((current) => !current)}
                onMouseDown={(event) => event.preventDefault()}
                edge="end"
              >
                {showPassword ? (
                  <VisibilityOffOutlinedIcon />
                ) : (
                  <VisibilityOutlinedIcon />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
