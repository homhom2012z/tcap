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
import type { UserSnapshot } from "@/lib/utils/types";
import { useTranslations } from "@/lib/contexts/LanguageContext";

interface DebtProjectionChartProps {
  snapshot: UserSnapshot;
  isAiMode?: boolean;
}

const DEBT_TYPE_COLORS: Record<string, string> = {
  CREDIT_CARD: "#ef4444",
  PERSONAL_LOAN: "#f59e0b",
  CAR_LOAN: "#3b82f6",
  HOME_LOAN: "#8b5cf6",
  OTHER: "#6b7280",
};

const TYPE_LABELS: Record<string, string> = {
  CREDIT_CARD: "Credit Card",
  PERSONAL_LOAN: "Personal Loan",
  CAR_LOAN: "Car Loan",
  HOME_LOAN: "Home Loan",
  OTHER: "Other",
};

export default function DebtProjectionChart({
  snapshot,
  isAiMode = false,
}: DebtProjectionChartProps) {
  const t = useTranslations("ai");

  if (snapshot.debts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-secondary py-12">
        <span className="material-symbols-outlined text-5xl mb-2 opacity-50">
          trending_down
        </span>
        <p>{t("noDebtData")}</p>
      </div>
    );
  }

  // Generate projection data
  const generateProjectionData = (mode: "standard" | "ai") => {
    const months = [];
    // Standard: 5% monthly decline
    // AI: Aggressive 10% monthly decline (simulated optimization)
    const monthlyDecline = mode === "ai" ? 0.08 : 0.03;

    for (let i = 0; i <= 12; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() + i);

      const dataPoint: any = {
        month: month.toLocaleDateString("en-US", { month: "short" }),
      };

      // Calculate declining balance for each debt type
      snapshot.debts.forEach((debt) => {
        const typeName = TYPE_LABELS[debt.type] || "Other";
        const currentAmount = dataPoint[typeName] || 0;

        // AI Mode prioritizes Credit Cards (Higher interest simulation)
        let declineRate = monthlyDecline;
        if (mode === "ai" && debt.type === "CREDIT_CARD") {
          declineRate = 0.15; // Aggressive paydown on cards
        }

        const projectedAmount =
          debt.outstandingBalance * Math.pow(1 - declineRate, i);
        dataPoint[typeName] =
          currentAmount + (projectedAmount > 100 ? projectedAmount : 0);
      });

      months.push(dataPoint);
    }

    return months;
  };

  const data = generateProjectionData(isAiMode ? "ai" : "standard");

  // Get unique debt types for areas
  const debtTypes = [...new Set(snapshot.debts.map((d) => d.type))];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce(
        (sum: number, item: any) => sum + item.value,
        0
      );

      return (
        <div className="glass-panel rounded-lg p-3 border border-border-primary shadow-xl bg-surface-primary backdrop-blur-md">
          <p className="text-text-primary font-semibold mb-2">
            {payload[0].payload.month} {isAiMode && "✨"}
          </p>
          <p className="text-text-secondary text-xs mb-2">
            Total: ฿{Math.round(total).toLocaleString()}
          </p>
          <div className="space-y-1">
            {payload.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs text-text-secondary">
                    {item.name}:
                  </span>
                </div>
                <span className="text-xs text-text-primary font-mono">
                  ฿{Math.round(item.value).toLocaleString()}
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
    <div className="h-full w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            {debtTypes.map((type) => (
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
                  stopColor={DEBT_TYPE_COLORS[type] || DEBT_TYPE_COLORS.OTHER}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={DEBT_TYPE_COLORS[type] || DEBT_TYPE_COLORS.OTHER}
                  stopOpacity={0.1}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="month"
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `฿${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            formatter={(value) => (
              <span className="text-text-primary text-xs font-medium opacity-80">
                {value}
              </span>
            )}
            iconType="circle"
          />
          {debtTypes.map((type) => (
            <Area
              key={type}
              type="monotone"
              dataKey={TYPE_LABELS[type] || "Other"}
              stackId="1"
              stroke={DEBT_TYPE_COLORS[type] || DEBT_TYPE_COLORS.OTHER}
              fill={`url(#color${type})`}
              animationDuration={1000}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
