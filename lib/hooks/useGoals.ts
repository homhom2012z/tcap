"use client";

import { useState, useEffect, useCallback } from "react";
import type { FinancialGoal } from "../utils/advancedTypes";
import type { UserSnapshot } from "../utils/types";
import { calculateDSR } from "../utils/calculator";

const GOALS_KEY = "tcap-goals";

export function useGoals(snapshot: UserSnapshot) {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);

  // Load goals
  useEffect(() => {
    const stored = localStorage.getItem(GOALS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setGoals(
        parsed.map((g: any) => ({
          ...g,
          createdAt: new Date(g.createdAt),
          deadline: g.deadline ? new Date(g.deadline) : undefined,
        }))
      );
    }
  }, []);

  // Save goals
  const saveGoals = useCallback((newGoals: FinancialGoal[]) => {
    localStorage.setItem(GOALS_KEY, JSON.stringify(newGoals));
    setGoals(newGoals);
  }, []);

  const createGoal = useCallback(
    (goal: Omit<FinancialGoal, "id" | "createdAt" | "status" | "current">) => {
      const { dsrPercent, totalDebt } = calculateDSR(snapshot);

      let current = 0;
      if (goal.type === "dsr_target") {
        current = dsrPercent;
      } else if (goal.type === "debt_free") {
        current = totalDebt;
      }

      const newGoal: FinancialGoal = {
        ...goal,
        id: Date.now().toString(),
        createdAt: new Date(),
        current,
        status: "on_track",
      };

      saveGoals([...goals, newGoal]);
    },
    [goals, saveGoals, snapshot]
  );

  const updateGoalProgress = useCallback(() => {
    const { dsrPercent, totalDebt } = calculateDSR(snapshot);

    const updatedGoals = goals.map((goal) => {
      let current = goal.current;
      let status = goal.status;

      if (goal.type === "dsr_target") {
        current = dsrPercent;
        if (dsrPercent <= goal.target) {
          status = "achieved";
        } else if (goal.deadline) {
          const daysLeft = Math.floor(
            (goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          status = daysLeft < 30 ? "behind" : "on_track";
        }
      } else if (goal.type === "debt_free") {
        current = totalDebt;
        status = totalDebt === 0 ? "achieved" : "on_track";
      }

      return { ...goal, current, status };
    });

    saveGoals(updatedGoals);
  }, [goals, saveGoals, snapshot]);

  const deleteGoal = useCallback(
    (id: string) => {
      saveGoals(goals.filter((g) => g.id !== id));
    },
    [goals, saveGoals]
  );

  // Auto-update progress
  useEffect(() => {
    if (goals.length > 0) {
      updateGoalProgress();
    }
  }, [snapshot]);

  return {
    goals,
    createGoal,
    updateGoalProgress,
    deleteGoal,
  };
}
