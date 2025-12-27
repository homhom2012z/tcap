"use client";

import { useEffect } from "react";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type = "success",
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: "check_circle",
    error: "error",
    info: "info",
    warning: "warning",
  };

  const colors = {
    success: "bg-primary/20 border-primary/40 text-primary",
    error: "bg-red-500/20 border-red-500/40 text-red-400",
    info: "bg-blue-500/20 border-blue-500/40 text-blue-400",
    warning: "bg-amber-500/20 border-amber-500/40 text-amber-400",
  };

  return (
    <div
      className={`fixed top-20 right-6 z-[200] glass-panel rounded-xl p-4 pr-12 border ${colors[type]} animate-slide-in-right shadow-2xl w-auto max-w-md`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span
          className={`material-symbols-outlined text-2xl flex-shrink-0 ${
            type === "success"
              ? "text-primary"
              : type === "error"
              ? "text-red-400"
              : type === "warning"
              ? "text-amber-400"
              : "text-blue-400"
          }`}
        >
          {icons[type]}
        </span>
        <p className="text-text-primary font-medium break-words flex-1 overflow-wrap-anywhere">
          {message}
        </p>
      </div>

      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-text-secondary hover:text-text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>
  );
}
