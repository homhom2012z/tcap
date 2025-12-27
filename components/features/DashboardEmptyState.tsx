"use client";

import Link from "next/link";

import { useTranslations } from "@/lib/contexts/LanguageContext";

export default function DashboardEmptyState() {
  const t = useTranslations("dashboard");

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 blur-3xl"></div>
        <div className="relative size-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-6xl">
            dashboard
          </span>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-text-primary mb-3">
        {t("welcome")}
      </h3>

      <p className="text-text-secondary text-center max-w-md mb-8">
        {t("getStarted")}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/liabilities"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:brightness-110 text-text-inverse font-bold rounded-xl shadow-glow transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          {t("addFirstDebt")}
        </Link>

        <Link
          href="/income-details"
          className="flex items-center gap-2 px-6 py-3 bg-surface-hover hover:bg-surface-primary text-text-primary font-medium rounded-xl border border-border-primary transition-all"
        >
          <span className="material-symbols-outlined">payments</span>
          {t("setIncome")}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-2xl">
        <div className="flex flex-col items-center text-center p-4">
          <span className="material-symbols-outlined text-primary text-3xl mb-2">
            trending_down
          </span>
          <p className="text-sm text-text-secondary">{t("trackDebts")}</p>
        </div>

        <div className="flex flex-col items-center text-center p-4">
          <span className="material-symbols-outlined text-primary text-3xl mb-2">
            calculate
          </span>
          <p className="text-sm text-text-secondary">{t("simulateLoan")}</p>
        </div>

        <div className="flex flex-col items-center text-center p-4">
          <span className="material-symbols-outlined text-primary text-3xl mb-2">
            insights
          </span>
          <p className="text-sm text-text-secondary">
            {t("smartRecommendations")}
          </p>
        </div>
      </div>
    </div>
  );
}
