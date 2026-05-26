"use client";

import { useContext } from "react";
import { LanguageContext } from "@/i18n/LanguageProvider";

export function useTranslations() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useTranslations must be used inside LanguageProvider");
  }

  return context;
}
