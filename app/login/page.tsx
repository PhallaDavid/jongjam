"use client";

import { useRouter } from "next/navigation";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/");
    } catch (err: any) {
      setError("Sign-in failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-400/20 dark:bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-8 flex flex-col gap-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-2xl font-black text-white">J</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Welcome to JongJam</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Sign in to access your notes and tasks
              </p>
            </div>
          </div>

          {/* Features preview */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "📝", label: "Notes", desc: "Write & organize" },
              { icon: "✅", label: "Tasks", desc: "Track & complete" },
            ].map((f) => (
              <div key={f.label} className="bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-3 text-center">
                <div className="text-xl mb-1">{f.icon}</div>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{f.label}</p>
                <p className="text-[10px] text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Google sign in */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 font-semibold text-sm text-zinc-800 dark:text-zinc-100 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {loading ? "Signing in…" : "Continue with Google"}
            </button>

            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            <p className="text-[11px] text-zinc-400 text-center leading-relaxed">
              By signing in, you agree to our Terms of Service.<br />
              Your data is stored securely in Firebase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
