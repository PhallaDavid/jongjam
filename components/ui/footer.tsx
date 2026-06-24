"use client";

import React from "react";
import { useLanguage } from "@/components/language-provider";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full py-6 mt-auto border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white/5 dark:bg-black/5 backdrop-blur-sm text-center">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium tracking-wide">
          {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
