"use client";

import { useState, useEffect, useCallback } from "react";
import type { Scenario } from "../utils/advancedTypes";
import type { UserSnapshot } from "../utils/types";

const SCENARIOS_KEY = "tcap-scenarios";

export function useScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  // Load scenarios
  useEffect(() => {
    const stored = localStorage.getItem(SCENARIOS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setScenarios(
        parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        }))
      );
    }
  }, []);

  const saveScenarios = useCallback((newScenarios: Scenario[]) => {
    localStorage.setItem(SCENARIOS_KEY, JSON.stringify(newScenarios));
    setScenarios(newScenarios);
  }, []);

  const saveScenario = useCallback(
    (
      snapshot: UserSnapshot,
      name: string,
      description?: string,
      simulationParams?: {
        loanAmount: number;
        interestRate: number;
        tenureYears: number;
      }
    ) => {
      // If simulation params are provided, we should "simulate" them as an added debt in the snapshot
      // so that the Dashboard/Results view reflects this scenario correctly.
      let scenarioSnapshot = snapshot;

      if (simulationParams) {
        // Calculate simulated installment
        const r = simulationParams.interestRate / 100 / 12;
        const n = simulationParams.tenureYears * 12;
        let monthlyPayment = 0;
        if (r > 0) {
          monthlyPayment =
            (simulationParams.loanAmount * r * Math.pow(1 + r, n)) /
            (Math.pow(1 + r, n) - 1);
        } else {
          monthlyPayment = simulationParams.loanAmount / n;
        }

        // Create a "Simulated Loan" debt
        const simulatedDebt: any = {
          id: "simulated-loan-" + Date.now(),
          lenderName: "Simulated Loan",
          type: "PERSONAL_LOAN",
          outstandingBalance: simulationParams.loanAmount,
          monthlyInstallment: Math.ceil(monthlyPayment),
          installmentPeriod: simulationParams.tenureYears * 12, // Save simulated term
          installmentUnit: "MONTHS",
        };

        // Append to snapshot debts
        scenarioSnapshot = {
          ...snapshot,
          debts: [...snapshot.debts, simulatedDebt],
        };
      }

      const stored = localStorage.getItem(SCENARIOS_KEY);
      let currentScenarios: Scenario[] = [];
      if (stored) {
        currentScenarios = JSON.parse(stored).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        }));
      } else {
        // Fallback to state if LS is empty? No, LS is truth.
        currentScenarios = [];
      }

      const scenario: Scenario = {
        id: Date.now().toString(),
        name,
        description,
        snapshot: scenarioSnapshot,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newScenarios = [...currentScenarios, scenario];
      saveScenarios(newScenarios);
      return scenario;
    },
    [saveScenarios]
  );

  const updateScenario = useCallback(
    (id: string, updates: Partial<Omit<Scenario, "id" | "createdAt">>) => {
      const stored = localStorage.getItem(SCENARIOS_KEY);
      let currentScenarios: Scenario[] = []; // Default to empty
      if (stored) {
        currentScenarios = JSON.parse(stored).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        }));
      }

      const updated = currentScenarios.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
      );
      saveScenarios(updated);
    },
    [saveScenarios]
  );

  const deleteScenario = useCallback(
    (id: string) => {
      const stored = localStorage.getItem(SCENARIOS_KEY);
      let currentScenarios: Scenario[] = [];
      if (stored) {
        currentScenarios = JSON.parse(stored).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        }));
      }

      saveScenarios(currentScenarios.filter((s) => s.id !== id));
    },
    [saveScenarios]
  );

  const renameScenario = useCallback(
    (id: string, name: string) => {
      updateScenario(id, { name });
    },
    [updateScenario]
  );

  return {
    scenarios,
    saveScenario,
    updateScenario,
    deleteScenario,
    renameScenario,
  };
}
