"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import type { UserSnapshot } from "@/lib/utils/types";
import { calculateDSR } from "@/lib/utils/calculator";

interface DSRTrendChartProps {
  snapshot: UserSnapshot;
  projectedIncome?: number;
  projectedDebts?: number;
}

export default function DSRTrendChart({
  snapshot,
  projectedIncome,
  projectedDebts,
}: DSRTrendChartProps) {
  const currentDSR = calculateDSR(snapshot).dsrPercent;

  // Generate trend data (current + 6 months projection)
  const generateTrendData = () => {
    const months = [];
    const now = new Date();

    // Current month
    months.push({
      month: now.toLocaleDateString("en-US", { month: "short" }),
      current: currentDSR,
      projected: null,
      healthyThreshold: 40,
      cautionThreshold: 60,
    });

    // Next 5 months (simple projection assuming no change)
    for (let i = 1; i <= 5; i++) {
      const futureDate = new Date(now);
      futureDate.setMonth(futureDate.getMonth() + i);

      const projectedDSR =
        projectedIncome && projectedDebts
          ? (projectedDebts / projectedIncome) * 100
          : currentDSR;

      months.push({
        month: futureDate.toLocaleDateString("en-US", { month: "short" }),
        current: null,
        projected: projectedDSR,
        healthyThreshold: 40,
        cautionThreshold: 60,
      });
    }

    return months;
  };

  const data = generateTrendData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = data.current || data.projected;

      return (
        <div className="glass-panel rounded-lg p-3 border border-white/10">
          <p className="text-white font-semibold mb-1">{data.month}</p>
          <p className="text-xs text-text-secondary mb-1">
            {data.current ? "Current" : "Projected"} DSR
          </p>
          <p
            className={`text-lg font-bold ${
              value <= 40
                ? "text-primary"
                : value <= 60
                ? "text-amber-500"
                : "text-red-500"
            }`}
          >
            {Math.round(value)}%
          </p>
          <p className="text-xs text-text-muted mt-2">
            {value <= 40
              ? "Healthy - Safe borrowing capacity"
              : value <= 60
              ? "Caution - Monitor spending"
              : "High - Reduce debt burden"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="healthyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b77f" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b77f" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cautionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="dangerGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />

          {/* Threshold zones */}
          <ReferenceLine
            y={40}
            stroke="#10b77f"
            strokeDasharray="3 3"
            label={{ value: "Healthy", position: "right", fill: "#10b77f" }}
          />
          <ReferenceLine
            y={60}
            stroke="#f59e0b"
            strokeDasharray="3 3"
            label={{ value: "Caution", position: "right", fill: "#f59e0b" }}
          />

          {/* Current DSR line */}
          <Line
            type="monotone"
            dataKey="current"
            stroke="#10b77f"
            strokeWidth={3}
            dot={{ fill: "#10b77f", r: 5 }}
            activeDot={{ r: 7 }}
          />

          {/* Projected DSR line */}
          <Line
            type="monotone"
            dataKey="projected"
            stroke="#60a5fa"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: "#60a5fa", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
