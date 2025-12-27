"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DebtHistoryChartProps {
  data: Array<{ date: string; total: number; byType: Record<string, number> }>;
}

const DEBT_TYPE_COLORS: Record<string, string> = {
  CREDIT_CARD: "#ef4444",
  PERSONAL_LOAN: "#f59e0b",
  CAR_LOAN: "#3b82f6",
  HOME_LOAN: "#8b5cf6",
  OTHER: "#6b7280",
};

const DEBT_TYPE_LABELS: Record<string, string> = {
  CREDIT_CARD: "Credit Card",
  PERSONAL_LOAN: "Personal Loan",
  CAR_LOAN: "Car Loan",
  HOME_LOAN: "Home Loan",
  OTHER: "Other",
};

export default function DebtHistoryChart({ data }: DebtHistoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-text-secondary">
        No historical data available
      </div>
    );
  }

  // Transform data for stacked area chart
  const chartData = data.map((item) => ({
    date: item.date,
    ...item.byType,
  }));

  // Get all unique debt types
  const allTypes = Array.from(
    new Set(data.flatMap((item) => Object.keys(item.byType)))
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce(
        (sum: number, entry: any) => sum + (entry.value || 0),
        0
      );

      return (
        <div className="glass-panel rounded-lg p-3 border border-white/10">
          <p className="text-sm text-text-secondary mb-2">
            {payload[0].payload.date}
          </p>
          <p className="text-lg font-bold text-primary mb-2">
            ฿{total.toLocaleString()}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs text-text-secondary">
                    {DEBT_TYPE_LABELS[entry.dataKey] || entry.dataKey}:
                  </span>
                </div>
                <span className="text-xs font-semibold text-text-primary">
                  ฿{entry.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          {allTypes.map((type) => (
            <linearGradient
              key={type}
              id={`color${type}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={DEBT_TYPE_COLORS[type]}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={DEBT_TYPE_COLORS[type]}
                stopOpacity={0.2}
              />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
        <YAxis
          stroke="#9ca3af"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => DEBT_TYPE_LABELS[value] || value}
          wrapperStyle={{ paddingTop: "10px" }}
        />

        {allTypes.map((type) => (
          <Area
            key={type}
            type="monotone"
            dataKey={type}
            stackId="1"
            stroke={DEBT_TYPE_COLORS[type]}
            fill={`url(#color${type})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
