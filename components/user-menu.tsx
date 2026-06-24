"use client";

import { useAuth } from "./auth-provider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function UserMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = () => {
    if (auth) {
      signOut(auth);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 hover:border-violet-500 dark:hover:border-violet-400 transition-colors"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-violet-500 flex items-center justify-center text-white text-sm font-bold">
            {user.email?.[0].toUpperCase() ?? "U"}
          </div>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden py-1">
            <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {user.displayName ?? "User"}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {user.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
