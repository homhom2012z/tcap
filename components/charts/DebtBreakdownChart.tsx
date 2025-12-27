"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { UserSnapshot } from "@/lib/utils/types";

interface DebtBreakdownChartProps {
  snapshot: UserSnapshot;
  loading?: boolean;
}

const COLORS = {
  CREDIT_CARD: "#ef4444",
  PERSONAL_LOAN: "#f59e0b",
  CAR_LOAN: "#3b82f6",
  HOME_LOAN: "#8b5cf6",
  OTHER: "#6b7280",
};

const TYPE_LABELS = {
  CREDIT_CARD: "Credit Card",
  PERSONAL_LOAN: "Personal Loan",
  CAR_LOAN: "Car Loan",
  HOME_LOAN: "Home Loan",
  OTHER: "Other",
};

export default function DebtBreakdownChart({
  snapshot,
  loading = false,
}: DebtBreakdownChartProps) {
  // Show loading skeleton
  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-48 h-48 rounded-full bg-surface-secondary"></div>
          <div className="flex gap-4">
            <div className="h-4 w-24 bg-surface-tertiary rounded"></div>
            <div className="h-4 w-24 bg-surface-tertiary rounded"></div>
            <div className="h-4 w-24 bg-surface-tertiary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Group debts by type
  const debtByType = snapshot.debts.reduce((acc, debt) => {
    const existing = acc.find((item) => item.type === debt.type);
    if (existing) {
      existing.value += debt.outstandingBalance;
    } else {
      acc.push({
        type: debt.type,
        name: TYPE_LABELS[debt.type] || debt.type,
        value: debt.outstandingBalance,
      });
    }
    return acc;
  }, [] as Array<{ type: string; name: string; value: number }>);

  if (debtByType.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
        <span className="material-symbols-outlined text-5xl mb-2 opacity-50">
          pie_chart
        </span>
        <p>No debt data to visualize</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel rounded-lg p-3 border border-white/10">
          <p className="text-white font-semibold">{payload[0].name}</p>
          <p className="text-primary font-mono">
            ฿{payload[0].value.toLocaleString()}
          </p>
          <p className="text-xs text-text-secondary">
            {(
              (payload[0].value /
                snapshot.debts.reduce(
                  (sum, d) => sum + d.outstandingBalance,
                  0
                )) *
              100
            ).toFixed(1)}
            %
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={debtByType}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              percent,
            }) => {
              if (
                !midAngle ||
                !percent ||
                !cx ||
                !cy ||
                !innerRadius ||
                !outerRadius
              )
                return null;

              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
              const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

              return percent > 0.05 ? (
                <text
                  x={x}
                  y={y}
                  fill="white"
                  textAnchor={x > cx ? "start" : "end"}
                  dominantBaseline="central"
                  className="text-xs font-bold"
                >
                  {`${(percent * 100).toFixed(0)}%`}
                </text>
              ) : null;
            }}
            outerRadius={80}
            dataKey="value"
          >
            {debtByType.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.type as keyof typeof COLORS] || COLORS.OTHER}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => (
              <span className="text-white text-sm">
                {value} (฿{entry.payload.value.toLocaleString()})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
