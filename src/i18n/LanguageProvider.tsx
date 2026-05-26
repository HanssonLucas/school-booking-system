"use client";

import { createContext, useMemo, useState } from "react";
import type { Language } from "@/i18n/translations";
import { translations } from "@/i18n/translations";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (typeof translations)[Language];
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);

type LanguageProviderProps = {
  children: React.ReactNode;
};

export default function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>("sv");

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language],
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
