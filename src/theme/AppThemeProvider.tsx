"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

type ColorMode = "light" | "dark";

type AppThemeContextValue = {
  mode: ColorMode;
  toggleColorMode: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

type AppThemeProviderProps = {
  children: React.ReactNode;
};

const isColorMode = (value: string): value is ColorMode => {
  return value === "light" || value === "dark";
};

export default function AppThemeProvider({ children }: AppThemeProviderProps) {
  const [mode, setMode] = useState<ColorMode>("light");

  useEffect(() => {
    const storedMode = window.localStorage.getItem("colorMode");

    if (storedMode && isColorMode(storedMode)) {
      queueMicrotask(() => {
        setMode(storedMode);
      });
    }
  }, []);

  const toggleColorMode = () => {
    setMode((currentMode) => {
      const newMode = currentMode === "light" ? "dark" : "light";
      window.localStorage.setItem("colorMode", newMode);
      return newMode;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode],
  );

  const value = useMemo(
    () => ({
      mode,
      toggleColorMode,
    }),
    [mode],
  );

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used inside AppThemeProvider");
  }

  return context;
}
