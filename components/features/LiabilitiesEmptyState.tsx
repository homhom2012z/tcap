"use client";

import Link from "next/link";

export default function LiabilitiesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 blur-3xl"></div>
        <div className="relative size-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-6xl">
            account_balance_wallet
          </span>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-text-primary mb-3">No Debts Added Yet</h3>

      <p className="text-text-secondary text-center max-w-md mb-8">
        Add your first debt to start tracking your financial obligations. You
        can manually add debts or import from bank statements.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <button
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:brightness-110 text-[#111816] font-bold rounded-xl shadow-glow transition-all"
          onClick={() => {
            // This will be handled by parent component
            const event = new CustomEvent("openAddDebt");
            window.dispatchEvent(event);
          }}
        >
          <span className="material-symbols-outlined">add</span>
          Add Debt Manually
        </button>
      </div>

      <div className="glass-card rounded-xl p-6 max-w-lg">
        <h4 className="text-text-primary font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            lightbulb
          </span>
          Example Debts You Might Add:
        </h4>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs text-primary">
              check_circle
            </span>
            Credit card balances
          </li>
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs text-primary">
              check_circle
            </span>
            Personal loans
          </li>
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs text-primary">
              check_circle
            </span>
            Car loans or leases
          </li>
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs text-primary">
              check_circle
            </span>
            Mortgage or home loans
          </li>
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs text-primary">
              check_circle
            </span>
            Student loans
          </li>
        </ul>
      </div>
    </div>
  );
}
