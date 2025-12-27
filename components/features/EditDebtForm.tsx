"use client";

import { useState } from "react";
import type { Debt, DebtType } from "@/lib/utils/types";
import { useTranslations } from "@/lib/contexts/LanguageContext";

interface EditDebtFormProps {
  debt: Debt;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Omit<Debt, "id">>) => Promise<void>;
}

type TermUnit = "MONTHS" | "YEARS" | "NONE";

export default function EditDebtForm({
  debt,
  onClose,
  onSave,
}: EditDebtFormProps) {
  const t = useTranslations("debtForm");
  const tCommon = useTranslations("common");
  const tTypes = useTranslations("debtTypes");

  const [lenderName, setLenderName] = useState(debt.lenderName);
  const [balance, setBalance] = useState(debt.outstandingBalance.toString());

  // Initialize with existing installment
  const [monthlyInstallment, setMonthlyInstallment] = useState(
    debt.monthlyInstallment?.toString() || ""
  );

  // Initialize with existing term info (if available, otherwise default to "MONTHS" if installment period exists, else NONE)
  const [termUnit, setTermUnit] = useState<TermUnit>(
    debt.installmentUnit || (debt.installmentPeriod ? "MONTHS" : "NONE")
  );
  const [termValue, setTermValue] = useState(
    debt.installmentPeriod?.toString() || ""
  );

  const [creditLimit, setCreditLimit] = useState(
    debt.creditLimit?.toString() || ""
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{
    lenderName?: string;
    balance?: string;
  }>({});

  // Touched fields
  const [touched, setTouched] = useState<{
    lenderName?: boolean;
    balance?: boolean;
  }>({});

  // Calculations
  const currentBalance = parseFloat(balance.replace(/,/g, "")) || 0;
  const currentTerm = parseFloat(termValue) || 0;

  // Auto-calculation logic override
  // If term is selected, we should perhaps show what the NEW installment would be?
  // But also allow manual override?
  // For Edit Form, let's keep it simple: If they change term, we update installment estimate.
  // If they type in installment, we respect that?
  // Let's mirror Add Form logic: Estimated Display vs Actual Saved Value.

  let estimatedPayment = 0;
  if (termUnit !== "NONE") {
    let months = 0;
    if (termUnit === "MONTHS") months = currentTerm;
    if (termUnit === "YEARS") months = currentTerm * 12;

    if (months > 0 && currentBalance > 0) {
      estimatedPayment = currentBalance / months;
    }
  }

  // Effect: When Term changes, should we update the "monthlyInstallment" state field?
  // Or is "monthlyInstallment" state field actually representing the manual input?
  // In the Add Form, we didn't have a "Monthly Installment" input field when Term was active.
  /// We should replicate that behavior here.
  // BUT: existing data might have custom installment.
  // Let's switch UI based on Term Unit.

  // Validation function
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!lenderName.trim()) {
      newErrors.lenderName = t("errors.lenderRequired");
    } else if (lenderName.trim().length < 2) {
      newErrors.lenderName = t("errors.lenderLength");
    }

    const balanceNum = parseFloat(balance.replace(/,/g, ""));
    if (!balance || isNaN(balanceNum)) {
      newErrors.balance = t("errors.balanceRequired");
    } else if (balanceNum <= 0) {
      newErrors.balance = t("errors.balancePositive");
    } else if (balanceNum > 100000000) {
      newErrors.balance = t("errors.balanceMax");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setTouched({ lenderName: true, balance: true });

    if (!validateForm()) return;

    const currentBalance = parseFloat(balance.replace(/,/g, ""));
    if (isNaN(currentBalance) || currentBalance < 0) return;

    setIsSubmitting(true);
    try {
      // Determine final installment value
      let finalInstallment = 0;
      if (termUnit === "NONE") {
        finalInstallment =
          parseFloat(monthlyInstallment.replace(/,/g, "")) || 0;
      } else {
        finalInstallment = estimatedPayment;
      }

      const updates: Partial<Omit<Debt, "id">> = {
        lenderName,
        outstandingBalance: currentBalance,
        monthlyInstallment: finalInstallment,
        installmentPeriod: termUnit !== "NONE" ? currentTerm : undefined,
        installmentUnit: termUnit,
      };

      if (creditLimit) {
        const limit = parseFloat(creditLimit.replace(/,/g, ""));
        if (!isNaN(limit) && limit > 0) {
          updates.creditLimit = limit;
        }
      }

      await onSave(debt.id, updates);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDebtTypeLabel = (type: DebtType): string => {
    switch (type) {
      case "CREDIT_CARD":
        return tTypes("CREDIT_CARD");
      case "PERSONAL_LOAN":
        return tTypes("PERSONAL_LOAN");
      case "CAR_LOAN":
        return tTypes("CAR_LOAN");
      case "HOME_LOAN":
        return tTypes("HOME_LOAN");
      case "OTHER":
        return "Other";
      default:
        return type;
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

      <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-surface-primary border border-white/10 shadow-2xl transition-all backdrop-blur-xl animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">edit</span>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {t("titleEdit")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Debt Type (Read-only) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t("debtType")}
            </label>
            <div className="w-full rounded-lg border border-white/10 bg-black/40 py-2.5 px-4 text-gray-400">
              {getDebtTypeLabel(debt.type)}
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                info
              </span>
              {t("typeImmutable")}
            </p>
          </div>

          {/* Lender Name */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t("lenderName")}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-500 group-focus-within:text-primary transition-colors text-[20px]">
                  account_balance
                </span>
              </div>
              <input
                type="text"
                value={lenderName}
                onChange={(e) => setLenderName(e.target.value)}
                className="block w-full rounded-lg border border-white/10 bg-black/40 py-2.5 pl-10 pr-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm focus:outline-none transition-all"
                placeholder={t("lenderPlaceholder")}
              />
            </div>
          </div>

          {/* Outstanding Balance */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t("outstandingBalance")}
            </label>
            <div className="relative group">
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="block w-full rounded-lg border border-white/10 bg-black/40 py-2.5 pl-4 pr-12 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm font-medium focus:outline-none transition-all"
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="text-gray-500 text-xs font-bold">THB</span>
              </div>
            </div>
          </div>

          {/* NEW: Installment Term */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t("installmentTerm")}
            </label>
            <div className="flex flex-col gap-3">
              {/* Radio Group */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="term_unit_edit"
                    checked={termUnit === "MONTHS"}
                    onChange={() => setTermUnit("MONTHS")}
                    className="text-primary focus:ring-primary bg-black/40 border-white/20"
                  />
                  <span className="text-sm text-gray-300">
                    {t("termMonths")}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="term_unit_edit"
                    checked={termUnit === "YEARS"}
                    onChange={() => setTermUnit("YEARS")}
                    className="text-primary focus:ring-primary bg-black/40 border-white/20"
                  />
                  <span className="text-sm text-gray-300">
                    {t("termYears")}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="term_unit_edit"
                    checked={termUnit === "NONE"}
                    onChange={() => setTermUnit("NONE")}
                    className="text-primary focus:ring-primary bg-black/40 border-white/20"
                  />
                  <span className="text-sm text-gray-300">{t("termNone")}</span>
                </label>
              </div>

              {/* Input for Term */}
              {termUnit !== "NONE" && (
                <div className="relative animate-fade-in-up">
                  <input
                    type="number"
                    value={termValue}
                    onChange={(e) => setTermValue(e.target.value)}
                    className="block w-full rounded-lg border border-white/10 bg-black/40 py-2.5 px-4 text-white placeholder-gray-500 focus:border-primary focus:ring-primary focus:ring-1 sm:text-sm outline-none transition-all"
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
                  <label className="block text-[10px] text-gray-500 uppercase">
                    Manual Monthly Payment
                  </label>
                  <input
                    type="number"
                    value={monthlyInstallment}
                    onChange={(e) => setMonthlyInstallment(e.target.value)}
                    className="block w-full rounded-lg border border-white/10 bg-black/40 py-2.5 px-4 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm outline-none transition-all"
                    placeholder="Specify monthly amount"
                    min="0"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Calculation Result (Only if Term is Active) */}
          {termUnit !== "NONE" && (
            <div className="flex items-start gap-2 p-3 rounded bg-emerald-900/20 border border-emerald-500/20 animate-fade-in">
              <span className="material-symbols-outlined text-emerald-400 text-[18px] mt-0.5">
                analytics
              </span>
              <div>
                <p className="text-xs text-emerald-400 font-medium">
                  {t("calculatedBurden")}
                </p>
                <p className="text-sm font-bold text-white">
                  ≈{" "}
                  {estimatedPayment.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  {tCommon("baht")} {tCommon("perMonth")}
                </p>
              </div>
            </div>
          )}

          {/* Credit Limit (Optional) */}
          {(debt.type === "CREDIT_CARD" || debt.creditLimit) && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {t("creditLimit")}
              </label>
              <div className="relative group">
                <input
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="block w-full rounded-lg border border-white/10 bg-black/40 py-2.5 pl-4 pr-12 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm font-medium focus:outline-none transition-all"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-xs font-bold">THB</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4 bg-black/20">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            {tCommon("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!lenderName || !balance || isSubmitting}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-[#111816] shadow-[0_0_15px_rgba(16,183,127,0.3)] hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(16,183,127,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-[#111816] border-t-transparent rounded-full animate-spin"></div>
            )}
            {isSubmitting ? t("saving") : t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
