"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/contexts/LanguageContext";
import DocumentationModal from "./DocumentationModal";

export default function DocumentationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("docs");

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-7 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#1e293b] text-primary shadow-[0_0_15px_rgba(16,183,127,0.3)] border border-primary/20 hover:scale-110 hover:shadow-[0_0_20px_rgba(16,183,127,0.5)] hover:bg-[#0f172a] transition-all duration-300 group"
        aria-label={t("title")}
        title={t("title")}
      >
        <span className="material-symbols-outlined text-[24px] group-hover:rotate-12 transition-transform">
          menu_book
        </span>
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1e293b] border border-primary/20 text-white text-sm font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none shadow-xl translate-x-2 group-hover:translate-x-0">
          {t("title")}
        </span>
      </button>

      {isOpen && <DocumentationModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
