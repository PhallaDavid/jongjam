"use client";

import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex items-center gap-3 text-zinc-400 dark:text-zinc-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
