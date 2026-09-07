"use client";

import { createContext, useCallback, useContext, useMemo } from "react";

import { CssBaseline } from "@mui/material";
import {
  ThemeProvider,
  createTheme,
  useColorScheme,
} from "@mui/material/styles";

type ColorMode = "light" | "dark";

type AppThemeContextValue = {
  mode: ColorMode;
  toggleColorMode: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

type AppThemeProviderProps = {
  children: React.ReactNode;
};

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "class",
  },
  colorSchemes: {
    dark: true,
  },
});

function AppThemeContextBridge({ children }: AppThemeProviderProps) {
  const { mode, setMode } = useColorScheme();

  const resolvedMode: ColorMode = mode === "dark" ? "dark" : "light";

  const toggleColorMode = useCallback(() => {
    setMode(resolvedMode === "light" ? "dark" : "light");
  }, [resolvedMode, setMode]);

  const value = useMemo(
    () => ({
      mode: resolvedMode,
      toggleColorMode,
    }),
    [resolvedMode, toggleColorMode],
  );

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export default function AppThemeProvider({ children }: AppThemeProviderProps) {
  return (
    <ThemeProvider
      theme={theme}
      defaultMode="light"
      modeStorageKey="colorMode"
      disableTransitionOnChange
    >
      <CssBaseline enableColorScheme />

      <AppThemeContextBridge>{children}</AppThemeContextBridge>
    </ThemeProvider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used inside AppThemeProvider");
  }

  return context;
}
