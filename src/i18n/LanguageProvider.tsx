"use client";

import { createContext, useEffect, useMemo, useState } from "react";
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

const isLanguage = (value: string): value is Language => {
  return value === "sv" || value === "en";
};

export default function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>("sv");

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem("language");

    if (storedLanguage && isLanguage(storedLanguage)) {
      queueMicrotask(() => {
        setLanguageState(storedLanguage);
      });
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    window.localStorage.setItem("language", newLanguage);
  };

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
