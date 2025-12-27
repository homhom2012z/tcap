"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "size-4 border-2",
    md: "size-8 border-3",
    lg: "size-12 border-4",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-white/20 border-t-primary rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
