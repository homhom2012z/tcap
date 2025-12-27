"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { UserSnapshot } from "@/lib/utils/types";
import { calculateDSR } from "@/lib/utils/calculator";

interface CashFlowChartProps {
  snapshot: UserSnapshot;
  loading?: boolean;
}

export default function CashFlowChart({
  snapshot,
  loading = false,
}: CashFlowChartProps) {
  // Show loading skeleton
  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col gap-4 w-full px-8">
          <div className="flex gap-4 mb-4">
            <div className="h-4 w-24 bg-surface-tertiary rounded"></div>
            <div className="h-4 w-24 bg-surface-tertiary rounded"></div>
            <div className="h-4 w-24 bg-surface-tertiary rounded"></div>
          </div>
          <div className="flex items-end gap-2 h-48">
            <div className="flex-1 h-32 bg-surface-secondary rounded"></div>
            <div className="flex-1 h-24 bg-surface-secondary rounded"></div>
            <div className="flex-1 h-16 bg-surface-secondary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const { totalMonthlyObligation } = calculateDSR(snapshot);
  const { grossMonthlyIncome } = snapshot;
  const freeCashFlow = grossMonthlyIncome - totalMonthlyObligation;

  const data = [
    {
      name: "Monthly Overview",
      Income: grossMonthlyIncome,
      Expenses: totalMonthlyObligation,
      "Free Cash": freeCashFlow > 0 ? freeCashFlow : 0,
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel rounded-lg p-3 border border-white/10">
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 mb-1"
            >
              <span className="text-sm text-text-secondary">{entry.name}:</span>
              <span className="text-primary font-mono font-bold">
                ฿{entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="#9ca3af" />
          <YAxis dataKey="name" type="category" stroke="#9ca3af" width={120} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "transparent" }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            formatter={(value) => (
              <span className="text-white text-sm">{value}</span>
            )}
          />
          <Bar dataKey="Income" fill="#10b77f" radius={[0, 8, 8, 0]} />
          <Bar dataKey="Expenses" fill="#ef4444" radius={[0, 8, 8, 0]} />
          <Bar dataKey="Free Cash" fill="#3b82f6" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
