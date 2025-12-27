"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserSnapshot, Debt } from "../utils/types";
import {
  getUserSnapshot,
  saveUserSnapshot,
  DEFAULT_SNAPSHOT,
} from "../utils/db";
import { v4 as uuidv4 } from "uuid";

export const useUserSnapshot = () => {
  const [snapshot, setSnapshot] = useState<UserSnapshot>(DEFAULT_SNAPSHOT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getUserSnapshot();
        if (data) {
          setSnapshot(data);
        } else {
          await saveUserSnapshot(DEFAULT_SNAPSHOT);
          setSnapshot(DEFAULT_SNAPSHOT);
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const addDebt = useCallback(async (debt: Omit<Debt, "id">) => {
    const newDebt: Debt = { ...debt, id: uuidv4() };

    setSnapshot((prev) => {
      const updated = {
        ...prev,
        debts: [...prev.debts, newDebt],
      };
      saveUserSnapshot(updated).catch(console.error);
      return updated;
    });
  }, []);

  const removeDebt = useCallback(async (id: string) => {
    setSnapshot((prev) => {
      const updated = {
        ...prev,
        debts: prev.debts.filter((d) => d.id !== id),
      };
      saveUserSnapshot(updated).catch(console.error);
      return updated;
    });
  }, []);

  const updateDebt = useCallback(
    async (id: string, updates: Partial<Omit<Debt, "id">>) => {
      setSnapshot((prev) => {
        const updated = {
          ...prev,
          debts: prev.debts.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        };
        saveUserSnapshot(updated).catch(console.error);
        return updated;
      });
    },
    []
  );

  const updateIncome = useCallback(async (income: number) => {
    setSnapshot((prev) => {
      const updated = { ...prev, grossMonthlyIncome: income };
      saveUserSnapshot(updated).catch(console.error);
      return updated;
    });
  }, []);

  const addIncomeSource = useCallback(
    async (source: { name: string; amount: number }) => {
      const newSource = { ...source, id: uuidv4() };
      setSnapshot((prev) => {
        const updated = {
          ...prev,
          additionalIncomes: [...(prev.additionalIncomes || []), newSource],
        };
        saveUserSnapshot(updated).catch(console.error);
        return updated;
      });
    },
    []
  );

  const removeIncomeSource = useCallback(async (id: string) => {
    setSnapshot((prev) => {
      const updated = {
        ...prev,
        additionalIncomes: (prev.additionalIncomes || []).filter(
          (i) => i.id !== id
        ),
      };
      saveUserSnapshot(updated).catch(console.error);
      return updated;
    });
  }, []);

  const clearAllDebts = useCallback(async () => {
    setSnapshot((prev) => {
      const updated = {
        ...prev,
        debts: [],
      };
      saveUserSnapshot(updated).catch(console.error);
      return updated;
    });
  }, []);

  return {
    snapshot,
    loading,
    addDebt,
    updateDebt,
    updateIncome,
    addIncomeSource,
    removeIncomeSource,
    removeDebt,
    clearAllDebts,
  };
};
