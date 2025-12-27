"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/lib/context/ThemeContext";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);

  // Prevent SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server or before mount
  if (!mounted) {
    return (
      <div className="size-10 rounded-full bg-white/5 border border-white/10" />
    );
  }

  return <ThemeToggleButton />;
}

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative size-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all group"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <span className="material-symbols-outlined text-yellow-400 group-hover:rotate-180 transition-transform duration-500">
          light_mode
        </span>
      ) : (
        <span className="material-symbols-outlined text-blue-400 group-hover:-rotate-180 transition-transform duration-500">
          dark_mode
        </span>
      )}
    </button>
  );
}
