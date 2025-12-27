"use client";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useState } from "react";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const switchLocale = (newLocale: "en" | "th") => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors"
        aria-label="Change language"
      >
        <span className="text-2xl">{locale === "th" ? "🇹🇭" : "🇬🇧"}</span>
        <span className="text-sm font-medium text-text-primary hidden sm:inline">
          {locale === "th" ? "ไทย" : "EN"}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 rounded-lg bg-surface-primary border border-border-primary shadow-lg z-20 overflow-hidden">
            <button
              onClick={() => switchLocale("en")}
              disabled={locale === "en"}
              aria-label="Select English"
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                locale === "en"
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-surface-hover text-text-primary"
              }`}
            >
              <span className="text-2xl">🇬🇧</span>
              <div>
                <div className="font-semibold">English</div>
                <div className="text-xs text-text-muted">English</div>
              </div>
              {locale === "en" && (
                <span className="material-symbols-outlined ml-auto text-primary">
                  check
                </span>
              )}
            </button>

            <button
              onClick={() => switchLocale("th")}
              disabled={locale === "th"}
              aria-label="Select Thai"
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                locale === "th"
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-surface-hover text-text-primary"
              }`}
            >
              <span className="text-2xl">🇹🇭</span>
              <div>
                <div className="font-semibold">ไทย</div>
                <div className="text-xs text-text-muted">Thai</div>
              </div>
              {locale === "th" && (
                <span className="material-symbols-outlined ml-auto text-primary">
                  check
                </span>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
