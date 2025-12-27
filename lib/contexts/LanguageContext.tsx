"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

type Locale = "en" | "th";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const STORAGE_KEY = "tcap_locale";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [messages, setMessages] = useState<Record<string, any>>({});

  // Load locale from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "th" || stored === "en") {
      setLocaleState(stored);
    }
  }, []);

  // Load messages when locale changes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const msgs = await import(`../../messages/${locale}.json`);
        setMessages(msgs.default);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };
    loadMessages();
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  };

  // Simple translation function with dot notation support and interpolation
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: any = messages;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    let text = (value || key) as string;

    if (params && typeof text === "string") {
      Object.entries(params).forEach(([key, val]) => {
        text = text.replace(`{${key}}`, String(val));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

// Hook for translations (similar to next-intl's useTranslations)
export function useTranslations(namespace?: string) {
  const { t, locale } = useLanguage();

  return (key: string, params?: Record<string, string | number>) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return t(fullKey, params);
  };
}
