"use client";

import type { Debt } from "@/lib/utils/types";
import { calculateMonthlyObligation } from "@/lib/utils/calculator";

interface PaymentTimelineProps {
  debts: Debt[];
}

const DEBT_TYPE_COLORS: Record<string, string> = {
  CREDIT_CARD: "#ef4444",
  PERSONAL_LOAN: "#f59e0b",
  CAR_LOAN: "#3b82f6",
  HOME_LOAN: "#8b5cf6",
  OTHER: "#6b7280",
};

export default function PaymentTimeline({ debts }: PaymentTimelineProps) {
  if (debts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-secondary py-12">
        <span className="material-symbols-outlined text-5xl mb-2 opacity-50">
          calendar_month
        </span>
        <p>No debts to display</p>
      </div>
    );
  }

  // Generate next 6 months
  const generateMonths = () => {
    const months = [];
    const now = new Date();

    for (let i = 0; i < 6; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() + i);
      months.push({
        name: date.toLocaleDateString("en-US", { month: "short" }),
        fullName: date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      });
    }

    return months;
  };

  const months = generateMonths();

  // Calculate total payment per month
  const monthlyTotal = debts.reduce(
    (sum, debt) => sum + calculateMonthlyObligation(debt),
    0
  );

  return (
    <div className="h-full w-full p-4 overflow-x-auto">
      <div className="mb-6">
        <h4 className="text-text-primary font-semibold mb-2">
          Monthly Payment Schedule
        </h4>
        <p className="text-text-secondary text-sm">
          Total: ฿{monthlyTotal.toLocaleString()}/month across {debts.length}{" "}
          debts
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {months.map((month, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-16 text-text-secondary text-sm font-medium">
              {month.name}
            </div>

            <div className="flex-1 flex gap-1 items-center">
              {debts.map((debt, debtIndex) => {
                const payment = calculateMonthlyObligation(debt);
                const widthPercent = (payment / monthlyTotal) * 100;

                return (
                  <div
                    key={debtIndex}
                    className="group relative h-10 rounded transition-all hover:opacity-80 cursor-pointer"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor:
                        DEBT_TYPE_COLORS[debt.type] || DEBT_TYPE_COLORS.OTHER,
                      minWidth: "30px",
                    }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="glass-panel rounded-lg p-3 border border-white/10 whitespace-nowrap">
                        <p className="text-white font-semibold text-sm">
                          {debt.lenderName}
                        </p>
                        <p className="text-text-secondary text-xs">
                          ฿{payment.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="w-24 text-right text-text-primary font-mono text-sm">
              ฿{monthlyTotal.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-border-primary">
        <p className="text-text-secondary text-xs mb-3">Debts:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {debts.map((debt, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{
                  backgroundColor:
                    DEBT_TYPE_COLORS[debt.type] || DEBT_TYPE_COLORS.OTHER,
                }}
              ></div>
              <span className="text-text-primary text-xs truncate">
                {debt.lenderName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
