"use client";

import { useState } from "react";
import type { Debt } from "@/lib/utils/types";
import {
  calculateSnowball,
  calculateAvalanche,
  compareStrategies,
} from "@/lib/utils/payoffCalculator";

interface PayoffCalculatorProps {
  debts: Debt[];
}

export default function PayoffCalculator({ debts }: PayoffCalculatorProps) {
  const [extraPayment, setExtraPayment] = useState("0");
  const [selectedMethod, setSelectedMethod] = useState<
    "snowball" | "avalanche"
  >("avalanche");

  if (debts.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <span className="material-symbols-outlined text-gray-500 text-5xl mb-3">
          calculate
        </span>
        <p className="text-text-secondary">
          Add debts to see payoff strategies
        </p>
      </div>
    );
  }

  const extraAmount = parseFloat(extraPayment.replace(/,/g, "")) || 0;
  const comparison = compareStrategies(debts, extraAmount);
  const selectedStrategy =
    selectedMethod === "snowball" ? comparison.snowball : comparison.avalanche;

  const years = Math.floor(selectedStrategy.totalMonths / 12);
  const months = selectedStrategy.totalMonths % 12;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            timeline
          </span>
          Debt Payoff Calculator
        </h3>
        <p className="text-text-secondary text-sm">
          Compare payoff strategies and see when you'll be debt-free
        </p>
      </div>

      {/* Extra Payment Input */}
      <div className="glass-card rounded-xl p-4">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Extra Monthly Payment
        </label>
        <div className="relative">
          <input
            type="number"
            value={extraPayment}
            onChange={(e) => setExtraPayment(e.target.value)}
            className="w-full rounded-lg border border-border-primary bg-surface-secondary py-3 pl-4 pr-16 text-text-primary placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary font-medium transition-colors"
            placeholder="0"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <span className="text-text-muted text-sm font-bold">THB/mo</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Amount you can afford to pay extra each month towards debt
        </p>
      </div>

      {/* Strategy Selector */}
      <div className="flex gap-3">
        <button
          onClick={() => setSelectedMethod("avalanche")}
          className={`flex-1 rounded-xl p-4 border-2 transition-all ${
            selectedMethod === "avalanche"
              ? "border-primary bg-primary/10 text-text-primary"
              : "border-border-primary bg-surface-secondary/30 text-text-secondary hover:border-border-hover hover:bg-surface-hover"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined">trending_down</span>
            <span className="font-bold">Avalanche</span>
          </div>
          <p className="text-xs opacity-80">Pay highest interest first</p>
          <p className="text-lg font-bold mt-2">
            ฿{comparison.avalanche.totalInterest.toLocaleString()}
          </p>
          <p className="text-xs">Total Interest</p>
        </button>

        <button
          onClick={() => setSelectedMethod("snowball")}
          className={`flex-1 rounded-xl p-4 border-2 transition-all ${
            selectedMethod === "snowball"
              ? "border-primary bg-primary/10 text-text-primary"
              : "border-border-primary bg-surface-secondary/30 text-text-secondary hover:border-border-hover hover:bg-surface-hover"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined">ac_unit</span>
            <span className="font-bold">Snowball</span>
          </div>
          <p className="text-xs opacity-80">Pay smallest balance first</p>
          <p className="text-lg font-bold mt-2">
            ฿{comparison.snowball.totalInterest.toLocaleString()}
          </p>
          <p className="text-xs">Total Interest</p>
        </button>
      </div>

      {/* Results */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h4 className="font-bold text-text-primary">
          {selectedMethod === "avalanche" ? "Avalanche" : "Snowball"} Method
          Results
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-secondary/50 rounded-lg p-4 border border-border-primary">
            <p className="text-text-secondary text-xs mb-1">Debt-Free In</p>
            <p className="text-lg sm:text-2xl font-bold text-primary">
              {years > 0 && `${years}y `}
              {months}m
            </p>
          </div>

          <div className="bg-surface-secondary/50 rounded-lg p-4 border border-border-primary">
            <p className="text-text-secondary text-xs mb-1">Total Interest</p>
            <p className="text-lg sm:text-2xl font-bold text-text-primary">
              ฿{selectedStrategy.totalInterest.toLocaleString()}
            </p>
          </div>

          <div className="bg-surface-secondary/50 rounded-lg p-4 border border-border-primary">
            <p className="text-text-secondary text-xs mb-1">Total Paid</p>
            <p className="text-lg sm:text-xl font-bold text-text-primary">
              ฿{selectedStrategy.totalPaid.toLocaleString()}
            </p>
          </div>

          <div className="bg-surface-secondary/50 rounded-lg p-4 border border-border-primary">
            <p className="text-text-secondary text-xs mb-1">Months</p>
            <p className="text-xl font-bold text-text-primary">
              {selectedStrategy.totalMonths}
            </p>
          </div>
        </div>

        {comparison.savings > 0 && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-green-400 text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">savings</span>
              {selectedMethod === "avalanche"
                ? `Save ฿${comparison.savings.toLocaleString()} vs Snowball`
                : `Costs ฿${Math.abs(
                    comparison.savings
                  ).toLocaleString()} more than Avalanche`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
