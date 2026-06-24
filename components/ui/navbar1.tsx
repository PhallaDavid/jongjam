"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/components/auth-provider";
import { UserMenu } from "@/components/user-menu";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { LanguageToggle } from "@/components/language-toggle";

interface Navbar1Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  auth?: {
    login: {
      text: string;
      url: string;
    };
    signup: {
      text: string;
      url: string;
    };
  };
}

const Navbar1 = ({
  logo = {
    url: "/",
    src: "https://www.shadcnblocks.com/images/block/block-1.svg",
    alt: "logo",
    title: "JongJam",
  },
  auth = {
    login: { text: "Log in", url: "#" },
    signup: { text: "Sign up", url: "#" },
  },
}: Navbar1Props) => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  return (
    <section className="py-3 backdrop-blur-md bg-white/10 dark:bg-black/10 border-b border-black/5 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex items-center justify-between h-10">
          {/* Logo */}
          <a href={logo.url} className="flex items-center gap-2">
            <img src={logo.src} className="w-8 h-8" alt={logo.alt} />
            <span className="text-lg font-bold tracking-tight">{t("appName")}</span>
          </a>

          {/* Right: language switcher + dark mode + auth */}
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ModeToggle />
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            ) : user ? (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="rounded-full font-semibold transition-colors hidden sm:flex h-10 px-5"
                >
                  <a href="/notes">{t("goToNotes")}</a>
                </Button>
                <UserMenu />
              </>
            ) : (
              <Button
                asChild
                className="rounded-full px-6 h-10 font-semibold shadow-md hover:shadow-lg transition-all dark:bg-white dark:text-black"
              >
                <a href="/login">{t("logInSignUp")}</a>
              </Button>
            )}
          </div>
        </nav>
      </div>
    </section>
  );
};

export { Navbar1 };
