"use client";

import React from "react";
import { useLanguage } from "@/components/language-provider";
import { Toggle } from "@/components/ui/toggle";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const handleToggle = (pressed: boolean) => {
    setLanguage(pressed ? "kh" : "en");
  };

  return (
    <Toggle
      variant="outline"
      aria-label="Toggle language"
      className="w-10 h-10 px-0 rounded-full flex items-center justify-center text-lg select-none hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
      pressed={language === "kh"}
      onPressedChange={handleToggle}
      title={language === "kh" ? "Switch to English" : "ប្តូរទៅភាសាខ្មែរ"}
    >
      {language === "kh" ? (
        <span className="scale-125 transform active:scale-95 transition-transform" role="img" aria-label="Cambodian Flag">🇰🇭</span>
      ) : (
        <span className="scale-125 transform active:scale-95 transition-transform" role="img" aria-label="US Flag">🇺🇸</span>
      )}
    </Toggle>
  );
}
