"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, TranslationKeys } from "@/lib/translations";

export type Language = "en" | "kh";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem("jongjam-lang") as Language;
    if (stored === "en" || stored === "kh") {
      setLanguageState(stored);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (language === "kh") {
      root.style.setProperty("--font-sans", "var(--font-khmer)");
      root.lang = "km";
    } else {
      root.style.setProperty("--font-sans", "var(--font-outfit)");
      root.lang = "en";
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("jongjam-lang", lang);
  };

  const t = (key: TranslationKeys): string => {
    const langDict = translations[language] || translations["en"];
    return langDict[key] || translations["en"][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
