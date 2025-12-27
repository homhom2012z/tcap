"use client";

import { useState, useEffect } from "react";
import type { DebtType } from "@/lib/utils/types";
import { calculateMonthlyObligation } from "@/lib/utils/calculator";
import { useToast } from "@/lib/contexts/ToastContext";
import { useTranslations } from "@/lib/contexts/LanguageContext";

interface AddDebtFormProps {
  onClose: () => void;
  onSave: (debt: {
    lenderName: string;
    type: DebtType;
    outstandingBalance: number;
    monthlyInstallment: number;
    installmentPeriod?: number;
    installmentUnit?: "MONTHS" | "YEARS" | "NONE";
    interestRate?: number;
  }) => Promise<void>;
}

type TermUnit = "MONTHS" | "YEARS" | "NONE";

export default function AddDebtForm({ onClose, onSave }: AddDebtFormProps) {
  const { showToast } = useToast();
  const t = useTranslations("debtForm");
  const tCommon = useTranslations("common");
  const tTypes = useTranslations("debtTypes");

  const [lenderName, setLenderName] = useState("");
  const [type, setType] = useState<DebtType>("CREDIT_CARD");
  const [balance, setBalance] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [termUnit, setTermUnit] = useState<TermUnit>("MONTHS");
  const [termValue, setTermValue] = useState(""); // Input for period (12, 5, etc.)
  const [manualInstallment, setManualInstallment] = useState(""); // For "NONE" case or override

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{
    lenderName?: string;
    balance?: string;
    term?: string;
    manualInstallment?: string;
  }>({});

  // Touched fields
  const [touched, setTouched] = useState<{
    lenderName?: boolean;
    balance?: boolean;
    term?: boolean;
    manualInstallment?: boolean;
  }>({});

  // Calculations
  const currentBalance = parseFloat(balance.replace(/,/g, "")) || 0;
  const currentInterestRate = parseFloat(interestRate) || 0;
  const currentTerm = parseFloat(termValue) || 0;

  // Derive estimated monthly payment
  let estimatedPayment = 0;

  if (termUnit === "NONE") {
    // If no fixed term, use manual input or default calc (but prioritized manual here)
    // Or we can fallback to old logic if manual is empty?
    // Let's rely on manual input for "No Fixed Term" for clarity, or
    // fallback to "minimum payment" logic (usually % of balance).
    // For now, let's say if NONE, user SHOULD enter installment manually.
    estimatedPayment = parseFloat(manualInstallment.replace(/,/g, "")) || 0;
  } else {
    // Term based calculation
    let months = 0;
    if (termUnit === "MONTHS") months = currentTerm;
    if (termUnit === "YEARS") months = currentTerm * 12;

    if (months > 0 && currentBalance > 0) {
      if (currentInterestRate > 0) {
        // PMT Calculation
        const r = currentInterestRate / 100 / 12;
        estimatedPayment =
          (currentBalance * r * Math.pow(1 + r, months)) /
          (Math.pow(1 + r, months) - 1);
      } else {
        estimatedPayment = currentBalance / months;
      }
    }
  }

  // --- Effect to auto-calculate default term for certain types? ---
  // Optional: e.g. Car Loan usually 48-84 months.

  // Validation function
  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Lender name validation
    if (!lenderName.trim()) {
      newErrors.lenderName = t("errors.lenderRequired");
    } else if (lenderName.trim().length < 2) {
      newErrors.lenderName = t("errors.lenderLength");
    }

    // Balance validation
    const balanceNum = parseFloat(balance.replace(/,/g, ""));
    if (!balance || isNaN(balanceNum)) {
      newErrors.balance = t("errors.balanceRequired");
    } else if (balanceNum <= 0) {
      newErrors.balance = t("errors.balancePositive");
    } else if (balanceNum > 100000000) {
      newErrors.balance = t("errors.balanceMax");
    }

    // Term validation
    if (termUnit !== "NONE") {
      if (!termValue || currentTerm <= 0) {
        newErrors.term = t("errors.termRequired");
      }
    } else {
      // If NONE, maybe require manual installment?
      // Let's make it optional but recommended.
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setTouched({
      lenderName: true,
      balance: true,
      term: true,
      manualInstallment: true,
    });

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        lenderName,
        type,
        outstandingBalance: currentBalance,
        monthlyInstallment: Math.ceil(estimatedPayment), // Use the calculated one
        installmentPeriod: termUnit !== "NONE" ? currentTerm : undefined,
        installmentUnit: termUnit,
        interestRate: currentInterestRate > 0 ? currentInterestRate : undefined,
      });
      showToast("Debt added successfully!", "success");
      onClose();
    } catch (error) {
      console.error(error);
      showToast("Failed to add debt. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[4px] transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-surface-secondary border border-border-primary shadow-2xl transition-all backdrop-blur-xl animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-primary">
          <h3 className="text-lg font-bold text-text-primary tracking-tight">
            {t("titleAdd")}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-text-secondary hover:text-text-primary transition-colors rounded-full p-1 hover:bg-surface-hover"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Lender Name */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {t("lenderName")} <span className="text-red-400">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span
                  className={`material-symbols-outlined group-focus-within:text-primary transition-colors text-[20px] ${
                    touched.lenderName && errors.lenderName
                      ? "text-red-400"
                      : "text-gray-500"
                  }`}
                >
                  account_balance
                </span>
              </div>
              <input
                type="text"
                value={lenderName}
                onChange={(e) => setLenderName(e.target.value)}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, lenderName: true }));
                  validateForm();
                }}
                className={`block w-full rounded-lg border ${
                  touched.lenderName && errors.lenderName
                    ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                    : "border-input-border focus:border-primary focus:ring-primary"
                } bg-input-bg py-2.5 pl-10 pr-3 text-text-primary placeholder-text-secondary focus:ring-1 sm:text-sm focus:outline-none transition-all`}
                placeholder={t("lenderPlaceholder")}
              />
            </div>
            {touched.lenderName && errors.lenderName && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  error
                </span>
                {errors.lenderName}
              </p>
            )}
          </div>

          {/* Debt Type */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {t("debtType")}
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "PERSONAL_LOAN", label: tTypes("PERSONAL_LOAN") },
                { id: "CREDIT_CARD", label: tTypes("CREDIT_CARD") },
                { id: "CAR_LOAN", label: tTypes("CAR_LOAN") },
                { id: "HOME_LOAN", label: tTypes("HOME_LOAN") },
                { id: "OTHER", label: t("other") },
              ].map((item) => (
                <label key={item.id} className="cursor-pointer group">
                  <input
                    type="radio"
                    name="debt_type"
                    className="peer sr-only"
                    checked={type === item.id}
                    onChange={() => setType(item.id as DebtType)}
                  />
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-input-border bg-input-bg text-text-secondary text-xs font-medium transition-all peer-checked:bg-primary peer-checked:text-text-inverse peer-checked:border-primary hover:bg-surface-hover peer-checked:hover:bg-primary">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Outstanding Balance */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {t("outstandingBalance")}{" "}
                <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, balance: true }));
                    validateForm();
                  }}
                  className={`block w-full rounded-lg border ${
                    touched.balance && errors.balance
                      ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                      : "border-input-border focus:border-primary focus:ring-primary"
                  } bg-input-bg py-2.5 pl-4 pr-12 text-text-primary placeholder-text-secondary focus:ring-1 sm:text-sm font-medium focus:outline-none transition-all`}
                  placeholder="0.00"
                  min="0"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-text-muted text-xs font-bold">THB</span>
                </div>
              </div>
              {touched.balance && errors.balance && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    error
                  </span>
                  {errors.balance}
                </p>
              )}
            </div>

            {/* Interest Rate */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {t("interestRate")}
              </label>
              <div className="relative group">
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="block w-full rounded-lg border border-input-border focus:border-primary focus:ring-primary bg-input-bg py-2.5 pl-4 pr-10 text-text-primary placeholder-text-secondary focus:ring-1 sm:text-sm font-medium focus:outline-none transition-all"
                  placeholder={type === "HOME_LOAN" ? "3.0" : "0.0"}
                  min="0"
                  step="0.01"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-text-muted text-xs font-bold">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* NEW: Installment Term */}
          <div className="space-y-3 pt-2 border-t border-border-secondary">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {t("installmentTerm")}
            </label>
            <div className="flex flex-col gap-3">
              {/* Radio Group */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="term_unit"
                    checked={termUnit === "MONTHS"}
                    onChange={() => setTermUnit("MONTHS")}
                    className="text-primary focus:ring-primary bg-input-bg border-input-border"
                  />
                  <span className="text-sm text-text-secondary">
                    {t("termMonths")}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="term_unit"
                    checked={termUnit === "YEARS"}
                    onChange={() => setTermUnit("YEARS")}
                    className="text-primary focus:ring-primary bg-input-bg border-input-border"
                  />
                  <span className="text-sm text-text-secondary">
                    {t("termYears")}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="term_unit"
                    checked={termUnit === "NONE"}
                    onChange={() => setTermUnit("NONE")}
                    className="text-primary focus:ring-primary bg-input-bg border-input-border"
                  />
                  <span className="text-sm text-text-secondary">
                    {t("termNone")}
                  </span>
                </label>
              </div>

              {/* Input for Term */}
              {termUnit !== "NONE" && (
                <div className="relative animate-fade-in-up">
                  <input
                    type="number"
                    value={termValue}
                    onChange={(e) => setTermValue(e.target.value)}
                    className="block w-full rounded-lg border border-input-border bg-input-bg py-2.5 px-4 text-text-primary placeholder-text-secondary focus:border-primary focus:ring-primary focus:ring-1 sm:text-sm outline-none transition-all"
                    placeholder={
                      termUnit === "MONTHS" ? t("enterMonths") : t("enterYears")
                    }
                    min="1"
                  />
                </div>
              )}

              {/* Manual Installment for NONE */}
              {termUnit === "NONE" && (
                <div className="relative animate-fade-in-up space-y-2">
                  <label className="block text-[10px] text-text-muted uppercase">
                    {t("manualMonthlyPayment")}
                  </label>
                  <input
                    type="number"
                    value={manualInstallment}
                    onChange={(e) => setManualInstallment(e.target.value)}
                    className="block w-full rounded-lg border border-input-border bg-input-bg py-2.5 px-4 text-text-primary placeholder-text-secondary focus:border-primary focus:ring-primary focus:ring-1 sm:text-sm outline-none transition-all"
                    placeholder={t("specifyMonthlyAmount")}
                    min="0"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Calculation Result */}
          <div className="flex items-start gap-2 p-3 rounded bg-surface-tertiary border border-border-secondary animate-fade-in">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
              analytics
            </span>
            <div>
              <p className="text-xs text-primary font-medium">
                {t("calculatedBurden")}
              </p>
              <p className="text-sm font-bold text-text-primary">
                ≈{" "}
                {estimatedPayment.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}{" "}
                {tCommon("baht")} {tCommon("perMonth")}
                {termUnit !== "NONE" && currentTerm > 0 && (
                  <span className="text-text-muted font-normal ml-1">
                    (over {currentTerm} {termUnit.toLowerCase()})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-surface-secondary/50 border-t border-border-primary flex gap-3 flex-row-reverse">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !lenderName.trim() || !balance}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-[#111816] shadow-[0_0_15px_rgba(16,183,127,0.3)] hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(16,183,127,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-[#111816] border-t-transparent rounded-full animate-spin"></div>
            )}
            {isSubmitting ? t("adding") : t("add")}
          </button>
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none sm:w-auto px-6 py-2.5 bg-transparent border border-input-border hover:bg-surface-hover text-text-secondary hover:text-text-primary text-sm font-medium rounded-lg transition-colors"
          >
            {tCommon("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
