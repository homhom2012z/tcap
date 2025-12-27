"use client";

import { useState, useEffect, useCallback } from "react";
import { calculateDSR } from "../utils/calculator";
import type { UserSnapshot } from "../utils/types";
import type { HistoricalSnapshot, HistoryMetrics } from "../types/history";

const STORAGE_KEY = "tcap_history";
const MAX_SNAPSHOTS = 12; // 12 months

export function useHistory() {
  const [snapshots, setSnapshots] = useState<HistoricalSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  // Load snapshots from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSnapshots(parsed);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save snapshot
  const saveSnapshot = useCallback((snapshot: UserSnapshot) => {
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    const { totalMonthlyObligation } = calculateDSR(snapshot);
    const totalDebt = snapshot.debts.reduce(
      (sum, debt) => sum + debt.outstandingBalance,
      0
    );
    const dsr =
      snapshot.grossMonthlyIncome > 0
        ? (totalMonthlyObligation / snapshot.grossMonthlyIncome) * 100
        : 0;

    const newSnapshot: HistoricalSnapshot = {
      id: `snapshot_${now.getTime()}`,
      timestamp: now.getTime(),
      date: dateKey,
      snapshot,
      dsr,
      totalDebt,
      totalMonthlyPayment: totalMonthlyObligation,
    };

    setSnapshots((prev) => {
      // Check if snapshot for this month already exists
      const filtered = prev.filter((s) => s.date !== dateKey);
      const updated = [...filtered, newSnapshot]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_SNAPSHOTS);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save history:", error);
      }

      return updated;
    });
  }, []);

  // Auto-save on significant changes
  const autoSave = useCallback(
    (snapshot: UserSnapshot) => {
      const now = new Date();
      const dateKey = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;

      // Check if we already have a snapshot for this month
      const existingSnapshot = snapshots.find((s) => s.date === dateKey);

      if (!existingSnapshot) {
        // Save first snapshot of the month
        saveSnapshot(snapshot);
      } else {
        // Update if significant change (>5% DSR change or >10% debt change)
        const { totalMonthlyObligation } = calculateDSR(snapshot);
        const newDSR =
          snapshot.grossMonthlyIncome > 0
            ? (totalMonthlyObligation / snapshot.grossMonthlyIncome) * 100
            : 0;
        const newTotalDebt = snapshot.debts.reduce(
          (sum, debt) => sum + debt.outstandingBalance,
          0
        );

        const dsrChange = Math.abs(newDSR - existingSnapshot.dsr);
        const debtChange = Math.abs(
          ((newTotalDebt - existingSnapshot.totalDebt) /
            existingSnapshot.totalDebt) *
            100
        );

        if (dsrChange > 5 || debtChange > 10) {
          saveSnapshot(snapshot);
        }
      }
    },
    [snapshots, saveSnapshot]
  );

  // Get metrics for charts
  const getMetrics = useCallback((): HistoryMetrics => {
    const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);

    const dsrTrend = sorted.map((s) => ({
      date: s.date,
      dsr: s.dsr,
    }));

    const debtTrend = sorted.map((s) => {
      const byType: Record<string, number> = {};
      s.snapshot.debts.forEach((debt) => {
        byType[debt.type] = (byType[debt.type] || 0) + debt.outstandingBalance;
      });
      return {
        date: s.date,
        total: s.totalDebt,
        byType,
      };
    });

    const paymentTrend = sorted.map((s) => ({
      date: s.date,
      payment: s.totalMonthlyPayment,
    }));

    return { dsrTrend, debtTrend, paymentTrend };
  }, [snapshots]);

  // Delete all history
  const clearHistory = useCallback(() => {
    setSnapshots([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  }, []);

  return {
    snapshots,
    loading,
    saveSnapshot,
    autoSave,
    getMetrics,
    clearHistory,
  };
}
