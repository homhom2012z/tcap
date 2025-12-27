"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUserSnapshot } from "@/lib/hooks/useUserSnapshot";
import { useToast } from "@/lib/contexts/ToastContext";
import NavBar from "@/components/layout/NavBar";
import { useTranslations } from "@/lib/contexts/LanguageContext";

export default function IncomeDetailsPage() {
  const {
    snapshot,
    updateIncome,
    addIncomeSource,
    removeIncomeSource,
    loading,
  } = useUserSnapshot();
  const { showToast } = useToast();
  const t = useTranslations("income");
  const tCommon = useTranslations("common");

  const [grossSalary, setGrossSalary] = useState("");
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceAmount, setNewSourceAmount] = useState("");

  // Validation states
  const [salaryError, setSalaryError] = useState("");
  const [sourceNameError, setSourceNameError] = useState("");
  const [sourceAmountError, setSourceAmountError] = useState("");

  useEffect(() => {
    if (snapshot) {
      setGrossSalary(snapshot.grossMonthlyIncome.toString());
    }
  }, [snapshot]);

  const handleSaveSalary = async () => {
    setSalaryError("");
    const amount = parseFloat(grossSalary.replace(/,/g, ""));

    if (!grossSalary || grossSalary.trim() === "") {
      setSalaryError("Gross salary is required");
      return;
    }

    if (isNaN(amount)) {
      setSalaryError("Please enter a valid number");
      return;
    }

    if (amount < 0) {
      setSalaryError("Salary cannot be negative");
      return;
    }

    if (amount === 0) {
      setSalaryError("Salary must be greater than zero");
      return;
    }

    await updateIncome(amount);
    showToast("Income details saved successfully!", "success");
  };

  const handleAddSource = async () => {
    setSourceNameError("");
    setSourceAmountError("");

    if (!newSourceName || newSourceName.trim() === "") {
      setSourceNameError("Source name is required");
      return;
    }

    if (newSourceName.trim().length < 2) {
      setSourceNameError("Source name must be at least 2 characters");
      return;
    }

    if (!newSourceAmount || newSourceAmount.trim() === "") {
      setSourceAmountError("Amount is required");
      return;
    }

    const amount = parseFloat(newSourceAmount.replace(/,/g, ""));

    if (isNaN(amount)) {
      setSourceAmountError("Please enter a valid number");
      return;
    }

    if (amount <= 0) {
      setSourceAmountError("Amount must be greater than zero");
      return;
    }

    await addIncomeSource({ name: newSourceName, amount });
    setNewSourceName("");
    setNewSourceAmount("");
    setIsAddingSource(false);
  };

  const totalIncome =
    (parseFloat(grossSalary) || 0) +
    (snapshot.additionalIncomes?.reduce((acc, curr) => acc + curr.amount, 0) ||
      0);

  if (loading)
    return (
      <div className="bg-bg-primary text-text-primary font-display min-h-screen flex flex-col overflow-hidden">
        <NavBar />
        <main className="flex-1 relative flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
            <div className="max-w-[1000px] mx-auto px-4 py-8 md:px-6 md:py-10 lg:px-8 lg:py-12 flex flex-col gap-6 md:gap-10">
              {/* Header Skeleton */}
              <div className="flex flex-col gap-3 text-center lg:text-left animate-pulse">
                <div className="h-10 bg-surface-secondary rounded-lg w-48 mx-auto lg:mx-0"></div>
                <div className="h-6 bg-surface-secondary/50 rounded-lg w-full max-w-2xl mx-auto lg:mx-0"></div>
              </div>

              <div className="glass-panel rounded-2xl p-8 lg:p-10 shadow-2xl flex flex-col gap-10 animate-pulse">
                {/* Gross Salary Skeleton */}
                <div className="flex flex-col gap-4">
                  <div className="h-6 bg-surface-secondary rounded w-32"></div>
                  <div className="h-12 bg-surface-secondary rounded-xl w-full"></div>
                  <div className="h-4 bg-surface-secondary/50 rounded w-full max-w-md"></div>
                </div>

                <div className="h-px w-full bg-border-primary/50"></div>

                {/* Additional Income Skeleton */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <div className="h-8 bg-surface-secondary rounded w-48"></div>
                    <div className="h-4 bg-surface-secondary/50 rounded w-64"></div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="h-20 bg-surface-secondary rounded-xl w-full"></div>
                    <div className="h-20 bg-surface-secondary rounded-xl w-full"></div>
                  </div>

                  <div className="h-14 bg-surface-secondary rounded-xl w-full border border-dashed border-border-primary"></div>
                </div>

                {/* Total Card Skeleton */}
                <div className="h-24 bg-surface-secondary rounded-xl w-full"></div>

                {/* Actions Skeleton */}
                <div className="h-10 bg-surface-secondary rounded-xl w-full sm:w-40 sm:self-end"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );

  return (
    <div className="bg-bg-primary text-text-primary font-display min-h-screen flex flex-col overflow-hidden selection:bg-primary selection:text-[#111816]">
      {/* Navigation */}
      <NavBar />

      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 dark:bg-primary/5 light:bg-primary/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/5 light:bg-primary/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

        <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
          <div className="max-w-[1000px] mx-auto px-6 py-10 lg:px-8 lg:py-12 flex flex-col gap-10">
            <div className="flex flex-col gap-3 text-center lg:text-left">
              <h2 className="text-text-primary text-2xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                {t("title")}
              </h2>
              <p className="text-text-secondary text-lg font-normal leading-normal max-w-3xl lg:mx-0 mx-auto">
                Update your monthly earnings to ensure accurate DSR
                calculations. We use this data to simulate your maximum
                borrowing limit.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 md:p-8 lg:p-10 shadow-2xl flex flex-col gap-8 md:gap-10">
              {/* Gross Salary */}
              <div className="flex flex-col gap-4">
                <label className="flex flex-col w-full">
                  <span className="text-text-primary text-base font-semibold leading-normal pb-3">
                    {t("grossSalary")}
                  </span>
                  <div className="flex w-full items-stretch rounded-xl shadow-lg transition-shadow focus-within:shadow-glow">
                    <input
                      type="number"
                      value={grossSalary}
                      onChange={(e) => {
                        setGrossSalary(e.target.value);
                        setSalaryError("");
                      }}
                      className={`flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-xl text-text-primary border bg-[var(--input-bg)] focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-4 pr-4 text-lg font-bold leading-normal placeholder:text-text-muted transition-colors outline-none ${
                        salaryError
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-border-primary"
                      }`}
                      placeholder="0.00"
                    />
                    <div className="text-text-secondary flex border border-border-primary border-l-0 bg-surface-secondary items-center justify-center px-4 rounded-r-xl">
                      <span className="text-sm font-semibold tracking-wide">
                        THB
                      </span>
                    </div>
                  </div>
                  {salaryError && (
                    <div className="flex items-center gap-2 px-1 mt-1">
                      <span className="material-symbols-outlined text-red-500 text-[16px]">
                        error
                      </span>
                      <p className="text-red-500 text-sm font-medium">
                        {salaryError}
                      </p>
                    </div>
                  )}
                </label>
                <div className="flex gap-2 items-start px-1">
                  <span className="material-symbols-outlined text-text-secondary text-[18px] mt-0.5">
                    info
                  </span>
                  <p className="text-text-secondary text-sm font-normal leading-normal">
                    This is your fixed income before taxes. This figure is the
                    primary baseline for your borrowing limit.
                  </p>
                </div>
              </div>

              <div className="h-px w-full bg-border-primary/50"></div>

              {/* Additional Income */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <h3 className="text-text-primary text-xl font-bold leading-tight">
                    {t("additionalIncome")}
                  </h3>
                  <p className="text-text-secondary text-base font-normal">
                    Freelance, rental income, or annual bonuses.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {snapshot.additionalIncomes?.map((source) => (
                    <div
                      key={source.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-[var(--input-bg)]/50 border border-border-primary hover:border-primary/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">
                            work
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-text-primary font-semibold">
                            {source.name}
                          </p>
                          <p className="text-text-secondary text-xs">
                            Monthly Average
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 mt-3 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                        <p className="text-text-primary font-bold text-lg">
                          + {source.amount.toLocaleString()}{" "}
                          <span className="text-xs text-text-secondary font-normal">
                            THB
                          </span>
                        </p>
                        <button
                          onClick={() => removeIncomeSource(source.id)}
                          className="text-text-secondary hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/5"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {isAddingSource ? (
                  <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--input-bg)] border border-border-primary">
                    <div className="flex flex-col gap-1">
                      <input
                        type="text"
                        placeholder="Source Name (e.g. Freelance)"
                        value={newSourceName}
                        onChange={(e) => {
                          setNewSourceName(e.target.value);
                          setSourceNameError("");
                        }}
                        className={`w-full bg-surface-secondary border rounded-lg p-2 text-text-primary transition-colors ${
                          sourceNameError
                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-border-primary focus:border-primary focus:ring-1 focus:ring-primary"
                        }`}
                      />
                      {sourceNameError && (
                        <div className="flex items-center gap-1 px-1">
                          <span className="material-symbols-outlined text-red-500 text-[14px]">
                            error
                          </span>
                          <p className="text-red-500 text-xs font-medium">
                            {sourceNameError}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <input
                        type="number"
                        placeholder="Amount (THB)"
                        value={newSourceAmount}
                        onChange={(e) => {
                          setNewSourceAmount(e.target.value);
                          setSourceAmountError("");
                        }}
                        className={`w-full bg-surface-secondary border rounded-lg p-2 text-text-primary transition-colors ${
                          sourceAmountError
                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-border-primary focus:border-primary focus:ring-1 focus:ring-primary"
                        }`}
                      />
                      {sourceAmountError && (
                        <div className="flex items-center gap-1 px-1">
                          <span className="material-symbols-outlined text-red-500 text-[14px]">
                            error
                          </span>
                          <p className="text-red-500 text-xs font-medium">
                            {sourceAmountError}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddSource}
                        className="bg-primary text-[#111816] px-4 py-2 rounded-lg font-bold"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setIsAddingSource(false)}
                        className="text-text-secondary px-4 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingSource(true)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border-primary h-14 bg-transparent hover:bg-border-primary/20 hover:border-primary/50 text-primary transition-all group"
                  >
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                      add_circle
                    </span>
                    <span className="text-sm font-semibold leading-normal">
                      Add Income Source
                    </span>
                  </button>
                )}
              </div>

              {/* Total Card */}
              <div className="bg-surface-primary rounded-xl border border-border-primary p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shadow-glow text-primary">
                    <span className="material-symbols-outlined text-[28px]">
                      savings
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-text-secondary text-sm font-medium uppercase tracking-wider opacity-80">
                      {t("totalIncome")}
                    </p>
                    <p className="text-primary text-xs font-normal">
                      Ready for simulation
                    </p>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-4xl font-black text-text-primary tracking-tight leading-none">
                    {totalIncome.toLocaleString()}
                  </p>
                  <p className="text-text-secondary text-sm font-medium mt-1">
                    THB / Month
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-2">
                <button
                  onClick={handleSaveSalary}
                  className="w-full sm:w-auto h-10 px-6 bg-gradient-to-r from-primary to-primary-dark hover:brightness-110 text-[#111816] text-sm font-bold leading-normal rounded-xl shadow-glow hover:shadow-[0_0_30px_rgba(17,212,147,0.3)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    check
                  </span>
                  Save Income Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
