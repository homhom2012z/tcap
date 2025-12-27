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
} from "recharts";

interface DSRHistoryChartProps {
  data: Array<{ date: string; dsr: number }>;
}

export default function DSRHistoryChart({ data }: DSRHistoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-text-secondary">
        No historical data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dsr = payload[0].value;
      const status = dsr < 40 ? "Healthy" : dsr < 60 ? "Caution" : "High Risk";
      const color =
        dsr < 40
          ? "text-green-400"
          : dsr < 60
          ? "text-yellow-400"
          : "text-red-400";

      return (
        <div className="glass-panel rounded-lg p-3 border border-white/10">
          <p className="text-sm  text-text-secondary mb-1">
            {payload[0].payload.date}
          </p>
          <p className={`text-lg font-bold ${color}`}>{dsr.toFixed(1)}% DSR</p>
          <p className="text-xs text-text-muted">{status}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
        <YAxis
          stroke="#9ca3af"
          tick={{ fontSize: 12 }}
          label={{
            value: "DSR %",
            angle: -90,
            position: "insideLeft",
            style: { fill: "#9ca3af" },
          }}
        />
        <Tooltip content={<CustomTooltip />} />

        {/* Reference lines for DSR thresholds */}
        <ReferenceLine
          y={40}
          stroke="#10b981"
          strokeDasharray="3 3"
          label={{
            value: "Healthy",
            position: "right",
            fill: "#10b981",
            fontSize: 10,
          }}
        />
        <ReferenceLine
          y={60}
          stroke="#f59e0b"
          strokeDasharray="3 3"
          label={{
            value: "Caution",
            position: "right",
            fill: "#f59e0b",
            fontSize: 10,
          }}
        />

        <Line
          type="monotone"
          dataKey="dsr"
          stroke="#10b77f"
          strokeWidth={3}
          dot={{ fill: "#10b77f", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
