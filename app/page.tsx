"use client";

import { Sparkles, FileText, CheckSquare, PenLine, ListTodo, ArrowRight } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Navbar1 } from "@/components/ui/navbar1";
import { useLanguage } from "@/components/language-provider";

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="relative min-h-screen">
      {/* Fixed navbar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar1 />
      </div>

      <AuroraBackground>
        <div className="z-10 w-full flex flex-col items-center justify-center text-center pt-28 pb-16 px-4 sm:px-6 gap-8 sm:gap-10 min-h-screen">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            {t("allInOne")}
          </div>

          {/* Headline */}
          <div className="flex flex-col gap-3 sm:gap-4 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
              {t("thinkIt")}{" "}
              <span className="bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-400 bg-clip-text text-transparent">
                {t("captureIt")}
              </span>{" "}
              {t("doIt")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-md mx-auto px-2">
              {t("headlineSub")}
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-xs sm:max-w-xl px-2">
            <a
              href="/notes"
              className="group flex flex-col gap-2 sm:gap-3 p-4 sm:p-6 rounded-2xl bg-white/40 dark:bg-black/30 backdrop-blur-md border border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-black/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="font-bold text-zinc-900 dark:text-white text-sm sm:text-lg">{t("notesTitle")}</p>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 hidden sm:block">
                  {t("notesDesc")}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 group-hover:gap-2 transition-all">
                {t("open")} <ArrowRight className="w-3 h-3" />
              </span>
            </a>

            <a
              href="/tasks"
              className="group flex flex-col gap-2 sm:gap-3 p-4 sm:p-6 rounded-2xl bg-white/40 dark:bg-black/30 backdrop-blur-md border border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-black/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-zinc-900 dark:text-white text-sm sm:text-lg">{t("tasksTitle")}</p>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 hidden sm:block">
                  {t("tasksDesc")}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:gap-2 transition-all">
                {t("open")} <ArrowRight className="w-3 h-3" />
              </span>
            </a>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none">
            <a
              href="/notes"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 sm:py-3.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-sm sm:text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              <PenLine className="w-4 h-4" />
              {t("startWriting")}
            </a>
            <a
              href="/tasks"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 sm:py-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white/30 dark:bg-black/20 backdrop-blur-sm font-medium text-sm sm:text-base text-zinc-700 dark:text-zinc-300 hover:bg-white/50 dark:hover:bg-black/30 transition-all duration-200"
            >
              <ListTodo className="w-4 h-4" />
              {t("manageTasks")}
            </a>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            {t("noAccount")}
          </p>
        </div>
      </AuroraBackground>
    </main>
  );
}
