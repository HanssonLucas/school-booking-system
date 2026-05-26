import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import LanguageProvider from "@/i18n/LanguageProvider";

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
    <html lang="sv">
      <body>
        <AppRouterCacheProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
