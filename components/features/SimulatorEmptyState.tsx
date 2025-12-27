"use client";

import Link from "next/link";

export default function SimulatorEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 blur-3xl"></div>
        <div className="relative size-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-6xl">
            calculate
          </span>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-text-primary mb-3">
        Loan Simulator
      </h3>

      <p className="text-text-secondary text-center max-w-md mb-8">
        Plan ahead by simulating new loan scenarios. See how additional debt
        would impact your Debt Service Ratio and monthly cash flow before making
        decisions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-2xl">
              lightbulb
            </span>
          </div>
          <h4 className="text-text-primary font-semibold mb-2">
            Smart Insights
          </h4>
          <p className="text-sm text-text-secondary">
            See instant DSR impact and whether you stay within safe borrowing
            limits
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-2xl">
              compare_arrows
            </span>
          </div>
          <h4 className="text-text-primary font-semibold mb-2">
            Compare Scenarios
          </h4>
          <p className="text-sm text-text-secondary">
            Test multiple loan options to find the best fit for your financial
            situation
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-2xl">
              timeline
            </span>
          </div>
          <h4 className="text-text-primary font-semibold mb-2">
            Project Future
          </h4>
          <p className="text-sm text-text-secondary">
            Visualize your debt journey with clear projections and payment
            schedules
          </p>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <Link
          href="/income-details"
          className="flex items-center gap-2 px-6 py-3 bg-surface-hover hover:bg-surface-primary text-text-primary font-medium rounded-xl border border-border-primary transition-all"
        >
          <span className="material-symbols-outlined">payments</span>
          Update Income First
        </Link>
      </div>

      <div className="mt-8 p-4 max-w-xl bg-primary/5 border border-primary/20 rounded-xl">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-xl mt-0.5">
            info
          </span>
          <div>
            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">Pro Tip:</span>{" "}
              For accurate simulations, make sure your income and existing debts
              are up to date. This helps calculate your actual borrowing
              capacity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
