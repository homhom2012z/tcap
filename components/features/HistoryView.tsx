"use client";

import { useHistory } from "@/lib/hooks/useHistory";
import DSRHistoryChart from "../charts/DSRHistoryChart";
import DebtHistoryChart from "../charts/DebtHistoryChart";

export default function HistoryView() {
  const { snapshots, loading, getMetrics } = useHistory();

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-surface-secondary rounded w-1/3 mb-4"></div>
          <div className="h-[300px] bg-surface-secondary rounded"></div>
        </div>
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-text-muted mb-4 block">
            history
          </span>
          <h3 className="text-xl font-bold text-text-primary mb-2">
            No Historical Data
          </h3>
          <p className="text-text-secondary">
            Your financial history will automatically be tracked over time
          </p>
        </div>
      </div>
    );
  }

  const metrics = getMetrics();
  const latest = snapshots[0];
  const oldest = snapshots[snapshots.length - 1];
  const dsrChange = latest.dsr - oldest.dsr;
  const debtChange = latest.totalDebt - oldest.totalDebt;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary">
              trending_down
            </span>
            <span className="text-sm text-text-secondary">DSR Change</span>
          </div>
          <p
            className={`text-2xl font-bold ${
              dsrChange < 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {dsrChange > 0 ? "+" : ""}
            {dsrChange.toFixed(1)}%
          </p>
          <p className="text-xs text-text-muted">Since {oldest.date}</p>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-blue-400">
              account_balance
            </span>
            <span className="text-sm text-text-secondary">
              Total Debt Change
            </span>
          </div>
          <p
            className={`text-2xl font-bold ${
              debtChange < 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {debtChange > 0 ? "+" : ""}฿{Math.abs(debtChange).toLocaleString()}
          </p>
          <p className="text-xs text-text-muted">
            {debtChange < 0 ? "Reduced" : "Increased"}
          </p>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-amber-500">
              history
            </span>
            <span className="text-sm text-text-secondary">Tracking Period</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {snapshots.length} {snapshots.length === 1 ? "month" : "months"}
          </p>
          <p className="text-xs text-text-muted">
            {oldest.date} to {latest.date}
          </p>
        </div>
      </div>

      {/* DSR Trend Chart */}
      <div className="glass-card rounded-2xl p-6 animate-chart-entrance">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary">
            show_chart
          </span>
          <h3 className="text-lg font-bold text-text-primary">DSR Trend</h3>
        </div>
        <div className="h-[300px]">
          <DSRHistoryChart data={metrics.dsrTrend} />
        </div>
      </div>

      {/* Debt Trend Chart */}
      <div className="glass-card rounded-2xl p-6 animate-chart-entrance stagger-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-amber-500">
            area_chart
          </span>
          <h3 className="text-lg font-bold text-text-primary">
            Debt Breakdown Over Time
          </h3>
        </div>
        <div className="h-[300px]">
          <DebtHistoryChart data={metrics.debtTrend} />
        </div>
      </div>
    </div>
  );
}
