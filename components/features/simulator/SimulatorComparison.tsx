"use client";

import { useMemo } from "react";
import { calculateDSR } from "@/lib/utils/calculator";
import type { UserSnapshot } from "@/lib/utils/types";

interface SimulatorComparisonProps {
  snapshot: UserSnapshot;
  scenarioA: {
    amount: number;
    tenure: number;
    rate: number;
  };
  scenarioB: {
    amount: number;
    tenure: number;
    rate: number;
  };
  onBack: () => void;
}

export default function SimulatorComparison({
  snapshot,
  scenarioA,
  scenarioB,
  onBack,
}: SimulatorComparisonProps) {
  const calculate = (amt: number, tenure: number, rate: number) => {
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = tenure * 12;
    const payment =
      (amt * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    const totalPayment = payment * numberOfPayments;
    const totalInterest = totalPayment - amt;

    const newTotalObligation =
      calculateDSR(snapshot).totalMonthlyObligation + payment;
    const dsr =
      snapshot.grossMonthlyIncome > 0
        ? (newTotalObligation / snapshot.grossMonthlyIncome) * 100
        : 0;

    return { payment, totalInterest, dsr };
  };

  const resultsA = useMemo(
    () => calculate(scenarioA.amount, scenarioA.tenure, scenarioA.rate),
    [scenarioA]
  );
  const resultsB = useMemo(
    () => calculate(scenarioB.amount, scenarioB.tenure, scenarioB.rate),
    [scenarioB]
  );

  const dsrImprovement = resultsA.dsr - resultsB.dsr;
  const paymentReduction = resultsA.payment - resultsB.payment;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-sm">
              compare_arrows
            </span>
            Comparison Mode
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-primary">
            Compare Loan Scenarios
          </h1>
          <p className="text-text-secondary mt-2 max-w-2xl">
            Review and compare your saved loan simulations side-by-side to make
            the best financial decision.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={onBack}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-lg bg-surface-primary border border-border-primary hover:bg-surface-hover text-sm font-medium text-text-secondary transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">
              restart_alt
            </span>{" "}
            Run New Simulation
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="glass-panel rounded-2xl p-0 overflow-hidden relative shadow-2xl shadow-black/50">
        <div className="absolute top-0 left-1/4 -mt-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 -mb-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-secondary bg-surface-secondary backdrop-blur-sm sticky top-0 z-20">
          <div className="p-6 hidden md:flex items-center text-text-secondary font-medium tracking-wide text-sm uppercase">
            Comparison Metrics
          </div>
          {/* Scenario A */}
          <div className="p-6 relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
            <div className="flex justify-between items-start mb-2">
              <span className="px-2 py-0.5 rounded bg-surface-secondary text-[10px] font-bold uppercase tracking-wider text-text-secondary border border-border-primary">
                Saved Scenario
              </span>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1">
              Scenario A ({scenarioA.tenure} Years)
            </h3>
            <p className="text-xs text-text-secondary">
              Higher monthly commitment
            </p>
          </div>
          {/* Scenario B */}
          <div className="p-6 relative group bg-surface-secondary/50">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
            <div className="flex justify-between items-start mb-2">
              <span className="px-2 py-0.5 rounded bg-primary/10 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20">
                Recommended
              </span>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1">
              Scenario B ({scenarioB.tenure} Years)
            </h3>
            <p className="text-xs text-text-secondary">Balanced monthly flow</p>
          </div>
        </div>

        {/* DSR Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-secondary border-t border-border-secondary group hover:bg-surface-hover transition-colors">
          <div className="p-6 flex items-center gap-3 bg-surface-secondary/50">
            <div className="size-10 rounded-lg bg-surface-primary border border-border-primary flex items-center justify-center text-text-secondary">
              <span className="material-symbols-outlined">pie_chart</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">
                Projected DSR
              </div>
              <div className="text-xs text-text-muted">Debt Service Ratio</div>
            </div>
          </div>

          <div className="p-6 flex flex-col justify-center">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-amber-500">
                {Math.round(resultsA.dsr)}%
              </span>
              <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase border border-amber-500/20">
                Warning
              </span>
            </div>
          </div>

          <div className="p-6 flex flex-col justify-center bg-surface-secondary/50 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary/50"></div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-primary">
                {Math.round(resultsB.dsr)}%
              </span>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase border border-primary/20">
                Healthy
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-primary text-xs font-bold bg-primary/10 w-fit px-2 py-0.5 rounded">
              <span className="material-symbols-outlined text-sm">
                arrow_downward
              </span>
              <span>{dsrImprovement.toFixed(1)}% Improvement</span>
            </div>
          </div>
        </div>

        {/* Payment Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-secondary border-t border-border-secondary group hover:bg-surface-hover transition-colors">
          <div className="p-5 flex items-center gap-3 md:bg-transparent bg-surface-primary/50">
            <div className="size-8 rounded-lg bg-surface-primary border border-border-primary flex items-center justify-center text-text-secondary">
              <span className="material-symbols-outlined text-sm">
                payments
              </span>
            </div>
            <div className="text-sm font-medium text-text-secondary">
              Monthly Payment
            </div>
          </div>
          <div className="p-5 flex items-center justify-between md:justify-start gap-4">
            <span className="md:hidden text-xs uppercase tracking-wider text-text-muted font-bold">
              Scenario A
            </span>
            <span className="text-xl font-mono text-text-primary tracking-tight">
              ฿ {Math.round(resultsA.payment).toLocaleString()}
            </span>
          </div>
          <div className="p-5 flex items-center justify-between md:justify-start gap-4 bg-surface-secondary/50">
            <span className="md:hidden text-xs uppercase tracking-wider text-text-muted font-bold">
              Scenario B
            </span>
            <div className="flex flex-col md:flex-row md:items-baseline gap-2">
              <span className="text-xl font-mono text-text-primary tracking-tight">
                ฿ {Math.round(resultsB.payment).toLocaleString()}
              </span>
              <span className="text-xs text-primary font-medium flex items-center gap-0.5">
                <span className="material-symbols-outlined text-sm">
                  arrow_downward
                </span>{" "}
                ฿ {Math.round(paymentReduction).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Interest Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-secondary border-t border-border-secondary group hover:bg-surface-hover transition-colors">
          <div className="p-5 flex items-center gap-3 md:bg-transparent bg-surface-primary/50">
            <div className="size-8 rounded-lg bg-surface-primary border border-border-primary flex items-center justify-center text-text-secondary">
              <span className="material-symbols-outlined text-sm">
                trending_up
              </span>
            </div>
            <div className="text-sm font-medium text-text-secondary">
              Total Interest
            </div>
          </div>
          <div className="p-5 flex items-center justify-between md:justify-start gap-4">
            <span className="md:hidden text-xs uppercase tracking-wider text-text-muted font-bold">
              Scenario A
            </span>
            <span className="text-xl font-mono text-text-primary tracking-tight">
              ฿ {Math.round(resultsA.totalInterest).toLocaleString()}
            </span>
          </div>
          <div className="p-5 flex items-center justify-between md:justify-start gap-4 bg-surface-secondary/50">
            <span className="md:hidden text-xs uppercase tracking-wider text-text-muted font-bold">
              Scenario B
            </span>
            <div className="flex flex-col md:flex-row md:items-baseline gap-2">
              <span className="text-xl font-mono text-text-primary tracking-tight">
                ฿ {Math.round(resultsB.totalInterest).toLocaleString()}
              </span>
              <span className="text-xs text-red-400 font-medium flex items-center gap-0.5">
                <span className="material-symbols-outlined text-sm">
                  arrow_upward
                </span>{" "}
                ฿{" "}
                {Math.round(
                  resultsB.totalInterest - resultsA.totalInterest
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-border-secondary border-t border-border-secondary bg-surface-primary/40 backdrop-blur-xl">
          <div className="hidden md:block"></div>
          <div className="p-4">
            <button
              onClick={() => {
                // In a real implementation, this would navigate to add debt form
                // For now, show informative message
                alert(
                  `To proceed with Scenario A (${
                    scenarioA.tenure
                  } years):\n\n1. Go to Liabilities page\n2. Add a new debt with:\n   - Amount: ฿${scenarioA.amount.toLocaleString()}\n   - Interest: ${
                    scenarioA.rate
                  }%\n   - Tenure: ${
                    scenarioA.tenure
                  } years\n   - Monthly Payment: ฿${Math.round(
                    resultsA.payment
                  ).toLocaleString()}`
                );
              }}
              className="w-full py-3 rounded-xl border border-border-primary hover:bg-surface-hover text-text-secondary font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Proceed with A
            </button>
          </div>
          <div className="p-4 bg-surface-secondary/50">
            <button
              onClick={() => {
                alert(
                  `To proceed with Scenario B (${
                    scenarioB.tenure
                  } years):\n\n1. Go to Liabilities page\n2. Add a new debt with:\n   - Amount: ฿${scenarioB.amount.toLocaleString()}\n   - Interest: ${
                    scenarioB.rate
                  }%\n   - Tenure: ${
                    scenarioB.tenure
                  } years\n   - Monthly Payment: ฿${Math.round(
                    resultsB.payment
                  ).toLocaleString()}`
                );
              }}
              className="w-full py-3 rounded-xl bg-primary hover:bg-emerald-600 text-white font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group"
            >
              Proceed with B{" "}
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
