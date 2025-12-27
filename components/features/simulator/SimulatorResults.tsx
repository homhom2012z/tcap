"use client";

import { useState, useMemo, useEffect } from "react";
import {
  calculateDSR,
  calculateAmortizationSchedule,
} from "@/lib/utils/calculator";
import { triggerSimpleConfetti } from "@/lib/utils/confetti";
import type { UserSnapshot } from "@/lib/utils/types";

interface SimulatorResultsProps {
  snapshot: UserSnapshot;
  loanAmount: number;
  tenureYears: number;
  interestRate: number;
  onReset: () => void;
  onCompare: () => void;
  onSaveScenario?: () => void;
}

export default function SimulatorResults({
  snapshot,
  loanAmount,
  tenureYears,
  interestRate,
  onReset,
  onCompare,
  onSaveScenario,
}: SimulatorResultsProps) {
  const [showAmortization, setShowAmortization] = useState(false);
  const currentDSR = calculateDSR(snapshot);
  const { grossMonthlyIncome } = snapshot;

  // New Loan Calculation
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

  // Amortization Schedule
  const amortizationSchedule = useMemo(() => {
    return calculateAmortizationSchedule(loanAmount, interestRate, tenureYears);
  }, [loanAmount, interestRate, tenureYears]);

  // Total Interest
  const totalPayment = monthlyPayment * tenureYears * 12;
  const totalInterest = totalPayment - loanAmount;

  // Projected DSR
  const newTotalObligation = currentDSR.totalMonthlyObligation + monthlyPayment;
  const projectedDSRPercent =
    grossMonthlyIncome > 0
      ? (newTotalObligation / grossMonthlyIncome) * 100
      : 0;

  const dsrIncrease = projectedDSRPercent - currentDSR.dsrPercent;
  const isHealthy = projectedDSRPercent <= 40;

  useEffect(() => {
    if (isHealthy) {
      triggerSimpleConfetti();
    }
  }, [isHealthy]); // Runs when healthy status is determined

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider">
          <span className="material-symbols-outlined text-sm">
            check_circle
          </span>
          Analysis Complete
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-text-primary">
          Simulation Results
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          Here is the projected impact of your new loan on your overall
          financial health and Debt Service Ratio (DSR).
        </p>
      </div>

      {/* Big Visual Card */}
      <div className="glass-panel rounded-2xl p-8 md:p-12 relative overflow-hidden">
        {/* Background Blurs */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-around gap-12 relative z-10">
          {/* Current */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative size-48 md:size-56 group">
              <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-border-secondary stroke-current"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="42"
                  strokeWidth="6"
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
                  strokeWidth="6"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm text-text-secondary uppercase tracking-widest font-medium mb-1">
                  Current
                </span>
                <span className="text-4xl md:text-5xl font-black text-text-primary group-hover:scale-110 transition-transform">
                  {Math.round(currentDSR.dsrPercent)}%
                </span>
                <span className="text-sm text-primary font-bold bg-primary/10 px-3 py-1 rounded-full mt-2">
                  Healthy
                </span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-4xl text-gray-600 hidden md:block animate-pulse">
              arrow_forward
            </span>
            <span className="material-symbols-outlined text-4xl text-gray-600 md:hidden animate-bounce">
              arrow_downward
            </span>
          </div>

          {/* Projected */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative size-56 md:size-64">
              {!isHealthy && (
                <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl animate-pulse"></div>
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
                  strokeWidth="6"
                ></circle>
                <circle
                  className={`${
                    isHealthy ? "text-primary" : "text-amber-500"
                  } stroke-current drop-shadow-[0_0_0px_rgba(245,158,11,0.6)]`}
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="42"
                  strokeDasharray={`${
                    (Math.min(projectedDSRPercent, 100) / 100) * 263.89
                  }, 263.89`}
                  strokeLinecap="round"
                  strokeWidth="6"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <span className="text-sm text-amber-400 uppercase tracking-widest font-medium mb-1">
                  Projected
                </span>
                <span className="text-5xl md:text-6xl font-black text-text-primary">
                  {Math.round(projectedDSRPercent)}%
                </span>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full mt-2 border ${
                    isHealthy
                      ? "text-primary bg-primary/10 border-primary/20"
                      : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                  }`}
                >
                  {isHealthy ? "Healthy" : "Caution"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center border-t border-border-primary pt-6">
          <p className="text-text-secondary max-w-2xl mx-auto">
            Adding this loan will increase your DSR by{" "}
            <span className="text-amber-400 font-bold">
              +{dsrIncrease.toFixed(1)}%
            </span>
            .
            {!isHealthy && (
              <>
                {" "}
                This pushes you into the{" "}
                <span className="text-text-primary font-medium">
                  Warning Zone
                </span>
                . Banks may scrutinize future applications more closely.
              </>
            )}
            {isHealthy && (
              <>
                {" "}
                You remain in the{" "}
                <span className="text-primary font-medium">Safe Zone</span>.
                This loan is likely to be approved.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-2 hover:bg-surface-hover transition-colors group">
          <div className="flex items-center gap-2 mb-1 text-text-secondary group-hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">payments</span>
            <span className="text-xs uppercase tracking-wider font-semibold">
              Loan Amount
            </span>
          </div>
          <div className="text-2xl font-bold text-text-primary font-mono">
            ฿ {loanAmount.toLocaleString()}
          </div>
          <div className="text-xs text-text-muted">Principal Requested</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-2 hover:bg-surface-hover transition-colors group">
          <div className="flex items-center gap-2 mb-1 text-text-secondary group-hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">
              calendar_today
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold">
              Tenure
            </span>
          </div>
          <div className="text-2xl font-bold text-text-primary font-mono">
            {tenureYears} Years
          </div>
          <div className="text-xs text-text-muted">
            {tenureYears * 12} Monthly Terms
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-2 hover:bg-surface-hover transition-colors relative overflow-hidden ring-1 ring-primary/30">
          <div className="absolute inset-0 bg-primary/5"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1 text-primary-dark">
              <span className="material-symbols-outlined text-xl text-primary">
                currency_exchange
              </span>
              <span className="text-xs uppercase tracking-wider font-bold text-primary">
                Monthly Pay
              </span>
            </div>
            <div className="text-2xl font-bold text-primary font-mono">
              ฿ {Math.round(monthlyPayment).toLocaleString()}
            </div>
            <div className="text-xs text-primary/70">Est. Installment</div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-2 hover:bg-surface-hover transition-colors group">
          <div className="flex items-center gap-2 mb-1 text-text-secondary group-hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">
              trending_up
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold">
              Total Interest
            </span>
          </div>
          <div className="text-2xl font-bold text-text-primary font-mono">
            ฿ {Math.round(totalInterest).toLocaleString()}
          </div>
          <div className="text-xs text-text-muted">@ {interestRate}% p.a.</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4 justify-center mt-2 pb-6 border-b border-border-primary">
        <button
          onClick={onReset}
          className="px-8 py-4 rounded-xl border border-border-primary text-text-secondary hover:text-text-primary hover:bg-surface-hover font-semibold flex items-center justify-center gap-2 transition-all w-full md:w-auto"
        >
          <span className="material-symbols-outlined">restart_alt</span>
          New Simulation
        </button>
        <button
          onClick={onCompare}
          className="px-8 py-4 rounded-xl border border-border-primary bg-surface-primary text-text-primary hover:bg-surface-hover font-semibold flex items-center justify-center gap-2 transition-all w-full md:w-auto"
        >
          <span className="material-symbols-outlined">compare_arrows</span>
          Compare Scenarios
        </button>
        <button
          onClick={onSaveScenario}
          className="flex-1 bg-primary hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">save</span>
          Save This Scenario
        </button>
      </div>

      {/* Amortization Table Toggle */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setShowAmortization(!showAmortization)}
          className="text-text-secondary hover:text-text-primary underline text-sm transition-colors"
        >
          {showAmortization
            ? "Hide Amortization Table"
            : "Show Amortization Table"}
        </button>
      </div>

      {/* Amortization Table */}
      {showAmortization && (
        <div className="glass-panel rounded-2xl p-6 animate-fade-in-up mt-4 overflow-hidden">
          <h3 className="text-xl font-bold text-text-primary mb-4">
            Amortization Schedule
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-secondary text-text-muted uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Month</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Principal</th>
                  <th className="px-4 py-3">Interest</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {amortizationSchedule.map((row) => (
                  <tr
                    key={row.month}
                    className="hover:bg-surface-hover transition-colors"
                  >
                    <td className="px-4 py-3 text-text-primary font-medium">
                      {row.month}
                    </td>
                    <td className="px-4 py-3 text-text-primary">
                      {Math.round(row.payment).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-success">
                      {Math.round(row.principal).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-error">
                      {Math.round(row.interest).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-text-primary text-right font-bold">
                      {Math.round(row.balance).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
