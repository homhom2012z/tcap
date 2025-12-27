"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export default function AnimatedButton({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  ...props
}: AnimatedButtonProps) {
  const baseClasses =
    "font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden";

  const variantClasses = {
    primary:
      "bg-primary hover:bg-emerald-600 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95",
    secondary:
      "bg-surface-primary hover:bg-surface-hover border border-border-primary text-text-primary active:scale-95",
    danger:
      "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 active:scale-95",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  const disabledClasses =
    "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100";

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled || loading ? disabledClasses : ""}
        ${className}
        group
      `}
      disabled={disabled || loading}
      {...props}
    >
      {/* Ripple effect on hover */}
      <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

      {loading ? (
        <>
          <span className="animate-spin material-symbols-outlined text-[18px]">
            progress_activity
          </span>
          <span className="relative z-10">Loading...</span>
        </>
      ) : (
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      )}
    </button>
  );
}
