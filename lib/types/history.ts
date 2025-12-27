import type { UserSnapshot } from "../utils/types";

export interface HistoricalSnapshot {
  id: string;
  timestamp: number;
  date: string; // "2025-01" format
  snapshot: UserSnapshot;
  dsr: number;
  totalDebt: number;
  totalMonthlyPayment: number;
}

export interface HistoryMetrics {
  dsrTrend: Array<{ date: string; dsr: number }>;
  debtTrend: Array<{
    date: string;
    total: number;
    byType: Record<string, number>;
  }>;
  paymentTrend: Array<{ date: string; payment: number }>;
}
