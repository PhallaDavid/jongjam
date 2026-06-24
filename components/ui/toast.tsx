"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info", title?: string, duration: number = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, title, duration }]);
    },
    []
  );

  const success = useCallback(
    (message: string, title?: string, duration?: number) => toast(message, "success", title, duration),
    [toast]
  );
  const error = useCallback(
    (message: string, title?: string, duration?: number) => toast(message, "error", title, duration),
    [toast]
  );
  const info = useCallback(
    (message: string, title?: string, duration?: number) => toast(message, "info", title, duration),
    [toast]
  );
  const warning = useCallback(
    (message: string, title?: string, duration?: number) => toast(message, "warning", title, duration),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      
      {/* Toast styles injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes toast-slide-in {
          from {
            transform: translateY(1rem) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .toast-animate-in {
          animation: toast-slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .toast-progress-bar {
          animation: toast-progress linear forwards;
        }
      `}} />

      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const { type, message, title, duration = 4000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
      border: "border-emerald-500/20 dark:border-emerald-500/30",
      progressBg: "bg-emerald-500",
      bg: "bg-emerald-50/90 dark:bg-emerald-950/20",
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
      border: "border-red-500/20 dark:border-red-500/30",
      progressBg: "bg-red-500",
      bg: "bg-red-50/90 dark:bg-red-950/20",
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
      border: "border-amber-500/20 dark:border-amber-500/30",
      progressBg: "bg-amber-500",
      bg: "bg-amber-50/90 dark:bg-amber-950/20",
    },
    info: {
      icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
      border: "border-blue-500/20 dark:border-blue-500/30",
      progressBg: "bg-blue-500",
      bg: "bg-blue-50/90 dark:bg-blue-950/20",
    },
  }[type];

  return (
    <div
      className={`toast-animate-in pointer-events-auto relative overflow-hidden flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100 ${config.border} transition-all duration-300 hover:shadow-2xl`}
      role="alert"
    >
      {config.icon}
      <div className="flex-1 flex flex-col gap-0.5">
        {title && <span className="font-semibold text-sm leading-none text-zinc-900 dark:text-white">{title}</span>}
        <span className="text-sm text-zinc-600 dark:text-zinc-300">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress timer indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-100 dark:bg-zinc-800/40">
        <div
          className={`h-full ${config.progressBg} toast-progress-bar`}
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
