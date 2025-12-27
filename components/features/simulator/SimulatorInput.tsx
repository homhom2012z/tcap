"use client";

import { useMemo } from "react";
import { calculateDSR } from "@/lib/utils/calculator";
import type { UserSnapshot } from "@/lib/utils/types";
import RangeSlider from "@/components/ui/RangeSlider";
import { useTranslations } from "@/lib/contexts/LanguageContext";

interface SimulatorInputProps {
  snapshot: UserSnapshot;
  loanType: string;
  setLoanType: (val: string) => void;
  loanAmount: number;
  setLoanAmount: (val: number) => void;
  tenureYears: number;
  setTenureYears: (val: number) => void;
  interestRate: number;
  setInterestRate: (val: number) => void;
  onRunSimulation: () => void;
  onSaveScenario?: () => void;
}

export default function SimulatorInput({
  snapshot,
  loanType,
  setLoanType,
  loanAmount,
  setLoanAmount,
  tenureYears,
  setTenureYears,
  interestRate,
  setInterestRate,
  onRunSimulation,
  onSaveScenario,
}: SimulatorInputProps) {
  const t = useTranslations("simulator");
  const tCommon = useTranslations("common");
  // Current DSR Calculation
  const currentDSR = calculateDSR(snapshot);
  const { grossMonthlyIncome } = snapshot;
  const { totalMonthlyObligation } = currentDSR;

  // New Loan Calculation (PMT Formula)
  const monthlyPayment = useMemo(() => {
    if (loanAmount <= 0) return 0;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = tenureYears * 12;

    if (interestRate === 0) return loanAmount / numberOfPayments;

    return (
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    );
  }, [loanAmount, tenureYears, interestRate]);

  // Projected DSR Calculation
  const newTotalObligation = totalMonthlyObligation + monthlyPayment;
  const projectedDSRPercent =
    grossMonthlyIncome > 0
      ? (newTotalObligation / grossMonthlyIncome) * 100
      : 0;

  const isProjectedHealthy = projectedDSRPercent <= 40;
  const dsrIncrease = projectedDSRPercent - currentDSR.dsrPercent;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-fade-in-up">
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-primary">
            {t("simulateNewLoan")}
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl">
            Adjust parameters to analyze impact on your Debt Service Ratio
            (DSR).
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
          <span className="material-symbols-outlined text-lg">
            verified_user
          </span>
          <span>
            {t("basedOnLive")} ({grossMonthlyIncome.toLocaleString()} THB/mo)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Controls */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col gap-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-primary pb-4">
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  tune
                </span>
                {t("parameters")}
              </h3>
              <button
                onClick={() => {
                  setLoanAmount(500000);
                  setTenureYears(3);
                  setInterestRate(7.5);
                }}
                className="text-xs text-text-secondary hover:text-text-primary underline decoration-dashed"
              >
                {tCommon("reset")}
              </button>
            </div>

            {/* Loan Category */}
            <div className="flex flex-col gap-3">
              <label className="text-text-secondary text-sm font-medium">
                {t("loanType")}
              </label>
              <div className="relative">
                <select
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                  className="w-full bg-surface-primary border border-border-primary rounded-xl px-4 py-3.5 text-text-primary appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  <option value="personal">Personal Loan</option>
                  <option value="auto">Auto Loan</option>
                  <option value="mortgage">Mortgage</option>
                  <option value="business">Small Business</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Loan Amount Slider */}
            <RangeSlider
              min={1}
              max={5000000}
              step={1000}
              value={loanAmount}
              onChange={setLoanAmount}
              label={t("loanAmount")}
              formatValue={(val) => `฿ ${val.toLocaleString()}`}
              minLabel="฿ 0"
              maxLabel="฿ 5M"
              showInput={true}
            />

            {/* Tenure Slider */}
            <RangeSlider
              min={1}
              max={30}
              step={1}
              value={tenureYears}
              onChange={setTenureYears}
              label={t("tenure")}
              formatValue={(val) => `${val} Years`}
              minLabel="1 Year"
              maxLabel="30 Years"
              showInput={true}
            />

            {/* Interest Rate Input */}
            <div className="flex flex-col gap-3">
              <label className="text-text-secondary text-sm font-medium">
                {t("interestRate")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full bg-surface-primary border border-border-primary rounded-xl px-4 py-3.5 text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-text-muted"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm font-medium">
                  %
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel: Analysis */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* DSR Comparison Card */}
          <div className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-primary pb-4">
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">
                  analytics
                </span>
                Impact Analysis
              </h3>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary"></span>
                <span className="text-xs text-text-secondary uppercase tracking-wider">
                  Safe
                </span>
                <span className="size-2 rounded-full bg-amber-500 ml-2"></span>
                <span className="text-xs text-text-secondary uppercase tracking-wider">
                  Warning
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
              {/* Current DSR */}
              <div className="relative flex flex-col items-center gap-3">
                <div className="relative size-40">
                  <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="text-border-secondary stroke-current"
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="42"
                      strokeWidth="8"
                    ></circle>
                    <circle
                      className="text-primary stroke-current transition-all duration-1000 ease-out"
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="42"
                      strokeDasharray={`${
                        (currentDSR.dsrPercent / 100) * 263.89
                      }, 263.89`}
                      strokeLinecap="round"
                      strokeWidth="8"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-text-primary">
                      {Math.round(currentDSR.dsrPercent)}%
                    </span>
                    <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded">
                      Current
                    </span>
                  </div>
                </div>
                <p className="text-sm text-text-secondary font-medium">
                  Current DSR
                </p>
              </div>

              {/* Arrow Indicator */}
              <div className="hidden md:flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-gray-600 text-3xl">
                  arrow_right_alt
                </span>
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                  +{dsrIncrease.toFixed(1)}%
                </span>
              </div>

              {/* Projected DSR */}
              <div className="relative flex flex-col items-center gap-3">
                <div className="relative size-48">
                  {!isProjectedHealthy && (
                    <div className="absolute inset-0 bg-amber-500/5 rounded-full blur-xl animate-pulse"></div>
                  )}
                  <svg
                    className="size-full -rotate-90 relative z-10"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      className="text-border-secondary stroke-current"
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="42"
                      strokeWidth="8"
                    ></circle>
                    <circle
                      className={`${
                        isProjectedHealthy ? "text-primary" : "text-amber-500"
                      } stroke-current drop-shadow-[0_0_0px_rgba(245,158,11,0.5)] transition-all duration-1000 ease-out`}
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="42"
                      strokeDasharray={`${
                        (Math.min(projectedDSRPercent, 100) / 100) * 263.89
                      }, 263.89`}
                      strokeLinecap="round"
                      strokeWidth="8"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    <span className="text-4xl font-black text-text-primary">
                      {Math.round(projectedDSRPercent)}%
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded border mt-1 ${
                        isProjectedHealthy
                          ? "text-primary bg-primary/10 border-primary/20"
                          : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                      }`}
                    >
                      {isProjectedHealthy ? "Healthy" : "Caution"}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-text-primary font-semibold">
                  Projected DSR
                </p>
              </div>
            </div>

            {/* Summary Data Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="bg-surface-primary/50 border border-border-secondary rounded-xl p-4 flex flex-col gap-1">
                <p className="text-xs text-text-secondary uppercase tracking-wider">
                  {t("monthlyInstallment")}
                </p>
                <p className="text-2xl font-bold text-text-primary font-mono">
                  ฿ {Math.round(monthlyPayment).toLocaleString()}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Based on {interestRate}% interest rate
                </p>
              </div>
              <div className="bg-surface-primary/50 border border-border-secondary rounded-xl p-4 flex flex-col gap-1">
                <p className="text-xs text-text-secondary uppercase tracking-wider">
                  {t("newTotalObligation")}
                </p>
                <p className="text-2xl font-bold text-text-secondary font-mono">
                  ฿ {Math.round(newTotalObligation).toLocaleString()}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Current + New Loan
                </p>
              </div>
            </div>

            {/* Action Area */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                onClick={onSaveScenario}
                className="flex-1 bg-surface-primary hover:bg-surface-hover text-text-primary font-semibold py-4 px-6 rounded-xl border border-border-primary transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">save</span>
                {t("saveScenario")}
              </button>
              <button
                onClick={onRunSimulation}
                className="flex-[2] bg-primary hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(16,183,127,0.3)] transition-all hover:shadow-[0_0_30px_rgba(16,183,127,0.5)] flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">play_arrow</span>
                {t("runSimulation")}
              </button>
            </div>
          </div>

          {/* Advice Box */}
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-400 mt-0.5">
              info
            </span>
            <div className="text-sm text-text-secondary">
              <strong className="text-blue-400 block mb-1">
                Did you know?
              </strong>
              Keeping your DSR below 40% significantly increases your chances of
              approval for future large-ticket loans like mortgages.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
