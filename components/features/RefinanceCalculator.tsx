"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "@/lib/contexts/LanguageContext";
import {
  calculateRefinanceComparison,
  RefinanceResult,
} from "@/lib/utils/calculator";
import type { Debt } from "@/lib/utils/types";

interface RefinanceCalculatorProps {
  debt?: Debt | null;
  onClose?: () => void;
}

export default function RefinanceCalculator({
  debt,
  onClose,
}: RefinanceCalculatorProps) {
  const t = useTranslations("refinance");
  const tCommon = useTranslations("common");

  // State for inputs
  const [outstanding, setOutstanding] = useState(
    debt?.outstandingBalance?.toString() || ""
  );
  const [remainingTermYears, setRemainingTermYears] = useState("20");
  const [currentRate, setCurrentRate] = useState(
    debt?.interestRate?.toString() || "5.0"
  );
  const [retentionRate, setRetentionRate] = useState("3.50");
  const [refinanceRate, setRefinanceRate] = useState("2.80");

  const [result, setResult] = useState<RefinanceResult | null>(null);

  // Auto-calculate on mount if debt exists, and on change
  useEffect(() => {
    handleCalculate();
  }, [
    outstanding,
    remainingTermYears,
    currentRate,
    retentionRate,
    refinanceRate,
  ]);

  const handleCalculate = () => {
    const bal = parseFloat(outstanding.replace(/,/g, ""));
    const term = parseFloat(remainingTermYears) * 12;
    const curR = parseFloat(currentRate);
    const retR = parseFloat(retentionRate);
    const refR = parseFloat(refinanceRate);

    if (bal > 0 && term > 0 && curR > 0) {
      const res = calculateRefinanceComparison(bal, curR, refR, retR, term);
      setResult(res);
    }
  };

  return (
    <div className="w-full bg-surface-primary rounded-2xl border border-border-primary overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="bg-surface-secondary px-6 py-4 flex items-center justify-between border-b border-border-primary">
        <div>
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400">
              currency_exchange
            </span>
            {t("title")}
          </h3>
          <p className="text-sm text-text-secondary">{t("subtitle")}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Inputs */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-muted uppercase">
              {t("inputs.outstanding")}
            </label>
            <div className="relative">
              <input
                type="number"
                value={outstanding}
                onChange={(e) => setOutstanding(e.target.value)}
                className="w-full bg-surface-secondary border border-border-primary rounded-lg px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-primary outline-none"
              />
              <span className="absolute right-4 top-2.5 text-text-muted text-sm">
                THB
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-muted uppercase">
                {t("inputs.remainingTerm")}
              </label>
              <input
                type="number"
                value={remainingTermYears}
                onChange={(e) => setRemainingTermYears(e.target.value)}
                className="w-full bg-surface-secondary border border-border-primary rounded-lg px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-muted uppercase">
                {t("inputs.currentRate")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={currentRate}
                  onChange={(e) => setCurrentRate(e.target.value)}
                  className="w-full bg-surface-secondary border border-border-primary rounded-lg px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-primary outline-none"
                />
                <span className="absolute right-4 top-2.5 text-text-muted text-sm">
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-border-primary my-4"></div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-emerald-400 uppercase">
                {t("inputs.retentionRate")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={retentionRate}
                  onChange={(e) => setRetentionRate(e.target.value)}
                  className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-emerald-500 outline-none"
                />
                <span className="absolute right-4 top-2.5 text-emerald-400 text-sm">
                  %
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-blue-400 uppercase">
                {t("inputs.refinanceRate")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={refinanceRate}
                  onChange={(e) => setRefinanceRate(e.target.value)}
                  className="w-full bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <span className="absolute right-4 top-2.5 text-blue-400 text-sm">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          {!result ? (
            <div className="h-full flex items-center justify-center text-text-muted">
              Enter details to compare...
            </div>
          ) : (
            <>
              {/* Recommendation Badge */}
              <div
                className={`p-4 rounded-xl flex items-center gap-4 ${
                  result.recommendation === "REFINANCE"
                    ? "bg-blue-500/20 border-blue-500/30"
                    : result.recommendation === "RETENTION"
                    ? "bg-emerald-500/20 border-emerald-500/30"
                    : "bg-gray-500/20 border-gray-500/30"
                }`}
              >
                <div
                  className={`size-12 rounded-full flex items-center justify-center ${
                    result.recommendation === "REFINANCE"
                      ? "bg-blue-500 text-white"
                      : result.recommendation === "RETENTION"
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-500 text-white"
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {result.recommendation === "REFINANCE"
                      ? "bank"
                      : result.recommendation === "RETENTION"
                      ? "verified"
                      : "hourglass_empty"}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase font-bold opacity-70 mb-0.5">
                    {t("results.recommendation")}
                  </p>
                  <p className="text-lg font-bold">
                    {result.recommendation === "REFINANCE"
                      ? t("results.move")
                      : result.recommendation === "RETENTION"
                      ? t("results.stay")
                      : t("results.wait")}
                  </p>
                </div>
              </div>

              {/* Comparison Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Retention Card */}
                <div
                  className={`p-4 rounded-xl border ${
                    result.recommendation === "RETENTION"
                      ? "bg-emerald-900/10 border-emerald-500/50"
                      : "bg-surface-secondary border-border-primary opacity-60"
                  }`}
                >
                  <div className="text-sm font-bold text-emerald-400 mb-2">
                    RETENTION
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-text-muted">
                      {t("results.monthlySaving")}
                    </p>
                    <p className="font-bold text-lg">
                      +
                      {Math.round(
                        result.monthlySavingRetention
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1 mt-3">
                    <p className="text-xs text-text-muted">
                      {t("results.totalSaving3Years")}
                    </p>
                    <p className="font-bold text-emerald-400">
                      +
                      {Math.round(
                        result.totalSaving3YearsRetention
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Refinance Card */}
                <div
                  className={`p-4 rounded-xl border ${
                    result.recommendation === "REFINANCE"
                      ? "bg-blue-900/10 border-blue-500/50"
                      : "bg-surface-secondary border-border-primary opacity-60"
                  }`}
                >
                  <div className="text-sm font-bold text-blue-400 mb-2">
                    REFINANCE
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-text-muted">
                      {t("results.totalSaving3Years")}
                    </p>
                    <p className="font-bold text-blue-400">
                      +
                      {Math.round(
                        result.totalSaving3YearsRefi
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1 mt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-muted">
                        {t("results.refinanceCost")}
                      </span>
                      <span className="text-error">
                        -{Math.round(result.refinanceCost).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">
                        {t("results.breakEven")}
                      </span>
                      <span className="text-text-primary">
                        {result.breakEvenMonths.toFixed(1)}{" "}
                        {t("results.months")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
