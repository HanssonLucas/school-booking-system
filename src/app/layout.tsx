import type { Metadata } from "next";

import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

import AuthProvider from "@/components/auth/Authprovider";
import LanguageProvider from "@/i18n/LanguageProvider";
import AppThemeProvider from "@/theme/AppThemeProvider";

export const metadata: Metadata = {
  title: "Bokningssystem",
  description: "Ett bokningssystem för handledning och muntliga redovisningar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript
          attribute="class"
          defaultMode="light"
          modeStorageKey="colorMode"
        />

        <AppRouterCacheProvider>
          <LanguageProvider>
            <AppThemeProvider>
              <AuthProvider>{children}</AuthProvider>
            </AppThemeProvider>
          </LanguageProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
