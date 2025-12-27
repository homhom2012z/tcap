"use client";

import { useState } from "react";
import Link from "next/link";
import { useUserSnapshot } from "@/lib/hooks/useUserSnapshot";
import { calculateDSR, calculateTaxSaving } from "@/lib/utils/calculator";
import { exportToCSV, printReport } from "@/lib/utils/export";
import { exportToPDF } from "@/lib/utils/pdfExport";
import AddDebtForm from "@/components/features/AddDebtForm";
import EditDebtForm from "@/components/features/EditDebtForm";
import PayoffCalculator from "@/components/features/PayoffCalculator";
import RefinanceCalculator from "@/components/features/RefinanceCalculator";
import type { Debt } from "@/lib/utils/types";
import NavBar from "@/components/layout/NavBar";
import { useTranslations } from "@/lib/contexts/LanguageContext";

interface ImportModalProps {
  onClose: () => void;
  onImport: (debts: any[]) => void;
}

function ImportModal({ onClose, onImport }: ImportModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to parse");

      const data = await res.json();
      if (data.debts && data.debts.length > 0) {
        onImport(data.debts);
        onClose();
      } else {
        alert("No active debts found in this report.");
        onClose();
      }
    } catch (error) {
      console.error("Import error:", error);
      alert("Failed to process file. Please ensure it's a valid NCB PDF.");
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border-primary bg-surface-primary shadow-xl animate-fade-in-up">
        <div className="flex items-center justify-between border-b border-border-primary px-6 py-4 bg-surface-secondary">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              upload_file
            </span>
            <h3 className="text-lg font-bold text-text-primary">
              Import Debt Data
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-6">
          {!isProcessing ? (
            <>
              <div className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-primary bg-surface-secondary/50 px-6 py-12 transition-all hover:border-primary/50 hover:bg-surface-hover cursor-pointer">
                <div className="mb-4 rounded-full bg-surface-primary p-4 ring-1 ring-border-primary transition-all group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary">
                  <span className="material-symbols-outlined text-4xl text-text-muted group-hover:text-primary transition-colors">
                    picture_as_pdf
                  </span>
                </div>
                <p className="mb-2 text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                  Click to upload or drag & drop
                </p>
                <p className="text-xs text-text-secondary">
                  Supported format: PDF (Credit Bureau Report)
                </p>
                <input
                  accept=".pdf"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  type="file"
                  onChange={handleFileChange}
                />
              </div>
              <div className="mt-4 flex items-start gap-3 rounded-lg bg-surface-secondary border border-border-primary p-3">
                <span className="material-symbols-outlined mt-0.5 text-sm text-text-secondary">
                  lock
                </span>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-text-primary">
                    Data Privacy Notice
                  </p>
                  <p className="text-xs leading-relaxed text-text-secondary">
                    Your credit report is processed securely in your browser's
                    memory. We <strong>do not store</strong> your file or
                    personal data on our servers.
                  </p>
                </div>
              </div>

              <div className="mt-2 flex items-start gap-3 rounded-lg bg-primary/5 border border-primary/10 p-3">
                <span className="material-symbols-outlined mt-0.5 text-sm text-primary">
                  auto_awesome
                </span>
                <p className="text-xs leading-relaxed text-text-secondary">
                  Our system will securely parse your NCB report (PDF) to
                  extract outstanding balances and monthly obligations.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="size-16 rounded-full border-4 border-border-primary border-t-primary animate-spin mb-4"></div>
              <p className="text-text-primary font-medium">
                Processing File...
              </p>
              <p className="text-sm text-text-secondary">
                Extracting liability information
              </p>
            </div>
          )}
        </div>

        {!isProcessing && (
          <div className="flex items-center justify-end gap-3 border-t border-border-primary px-6 py-4 bg-surface-secondary">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            {/* Process File button removed as file selection triggers processing */}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LiabilitiesPage() {
  const { snapshot, addDebt, removeDebt, updateDebt, clearAllDebts } =
    useUserSnapshot();
  const t = useTranslations("liabilities");
  const tCommon = useTranslations("common");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [checkingRefinanceDebt, setCheckingRefinanceDebt] =
    useState<Debt | null>(null);
  const [showPayoffCalculator, setShowPayoffCalculator] = useState(true);

  const { totalMonthlyObligation, dsrPercent, totalDebt } =
    calculateDSR(snapshot);

  const renderDebtIcon = (type: string) => {
    switch (type) {
      case "credit_card":
        return "credit_card";
      case "personal_loan":
        return "account_balance_wallet";
      case "auto_loan":
        return "directions_car";
      case "mortgage":
        return "home";
      default:
        return "attach_money";
    }
  };

  const handleImport = async (importedDebts: any[]) => {
    for (const debt of importedDebts) {
      await addDebt(debt);
    }
    setIsImportModalOpen(false);
  };

  const handleClearAll = () => {
    if (snapshot.debts.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete all ${snapshot.debts.length} debt(s)? This action cannot be undone.`
    );

    if (confirmed) {
      clearAllDebts();
    }
  };

  return (
    <div className="bg-bg-primary text-text-primary font-display min-h-screen flex flex-col overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Background Decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/5 dark:bg-primary/5 light:bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/5 dark:bg-primary/5 light:bg-primary/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top Navigation */}
        <NavBar />

        <main className="flex-1 w-full max-w-[1080px] mx-auto px-4 py-8 lg:px-8">
          {/* Page Header & Stats */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-10">
            <div className="flex flex-col gap-2 max-w-lg">
              <h1 className="text-text-primary text-4xl font-bold tracking-tight">
                {t("title")}
              </h1>
              <p className="text-text-secondary text-lg font-light">
                Manage your debts, track outstanding balances, and analyze your
                Debt Service Ratio (DSR).
              </p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              {/* Export Buttons */}
              <button
                onClick={() => exportToCSV(snapshot)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-text-primary bg-surface-primary hover:bg-surface-hover border border-border-primary transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
                CSV
              </button>
              <button
                onClick={() => exportToPDF(snapshot)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-text-primary bg-surface-primary hover:bg-surface-hover border border-border-primary transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  picture_as_pdf
                </span>
                PDF
              </button>
              <button
                onClick={printReport}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-text-primary bg-surface-primary hover:bg-surface-hover border border-border-primary transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  print
                </span>
                Print
              </button>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="flex min-w-[180px] flex-col gap-1 rounded-2xl p-5 bg-surface-primary border border-border-primary shadow-card">
                  <p className="text-text-secondary text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">
                      payments
                    </span>
                    Monthly Burden
                  </p>
                  <p className="text-text-primary text-2xl font-bold tracking-tight">
                    {Math.round(totalMonthlyObligation).toLocaleString()} THB
                  </p>
                </div>
                <div className="flex min-w-[180px] flex-col gap-1 rounded-2xl p-5 bg-surface-primary border border-border-primary shadow-card">
                  <p className="text-text-secondary text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">
                      pie_chart
                    </span>
                    Current DSR
                  </p>
                  <div className="flex items-end gap-2">
                    <p className="text-text-primary text-2xl font-bold tracking-tight">
                      {Math.round(dsrPercent)}%
                    </p>
                    <span
                      className={`text-xs font-bold mb-1 px-2 py-0.5 rounded-full ${
                        dsrPercent <= 40
                          ? "text-primary bg-primary/10"
                          : "text-amber-500 bg-amber-500/10"
                      }`}
                    >
                      {dsrPercent <= 40 ? "Safe" : "High"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* List Panel */}
          <div
            className={`glass-panel rounded-2xl flex flex-col relative overflow-hidden transition-all duration-500 ease-in-out ${
              snapshot.debts.length === 0 ? "h-[300px]" : "h-[600px]"
            }`}
          >
            <div className="flex items-center justify-between px-4 sm:px-6 py-5 border-b border-border-primary overflow-x-auto scrollbar-hide gap-4">
              <div className="flex items-center gap-3 shrink-0">
                <span className="material-symbols-outlined text-text-muted">
                  list_alt
                </span>
                <h3 className="text-text-primary font-semibold text-lg whitespace-nowrap">
                  {t("activeDebts")}
                </h3>
                <span className="bg-surface-secondary text-xs text-text-secondary px-2 py-1 rounded-full border border-border-secondary whitespace-nowrap">
                  {snapshot.debts.length} Items
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-2 bg-surface-primary hover:bg-surface-hover active:bg-surface-secondary text-text-primary border border-border-primary px-4 py-2 rounded-xl text-sm font-bold transition-all group whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[20px] text-red-400 group-hover:text-red-300 transition-colors">
                    picture_as_pdf
                  </span>
                  <span>{t("import")}</span>
                </button>

                {snapshot.debts.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-sm font-bold transition-all group whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      delete_sweep
                    </span>
                    <span className="hidden sm:inline">{t("clearAll")}</span>
                  </button>
                )}

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 active:bg-primary/80 text-[#111816] px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(16,183,127,0.3)] whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    add
                  </span>
                  <span>{t("addNew")}</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
              {snapshot.debts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-text-muted">
                  <span className="material-symbols-outlined text-5xl mb-2 opacity-50">
                    money_off
                  </span>
                  <p>No debts recorded.</p>
                </div>
              ) : (
                snapshot.debts.map((debt) => (
                  <div
                    key={debt.id}
                    className="glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl gap-4 group"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="flex items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 size-14 ring-1 ring-primary/20">
                        <span className="material-symbols-outlined text-2xl">
                          {renderDebtIcon(debt.type)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-text-primary text-base font-semibold leading-tight">
                          {debt.lenderName}
                        </p>
                        <p className="text-text-secondary text-sm font-normal mt-1">
                          Outstanding:{" "}
                          <span className="text-text-primary/90">
                            {debt.outstandingBalance.toLocaleString()} THB
                          </span>
                        </p>

                        {/* Tax Shield Badge for Home Loans */}
                        {debt.type === "HOME_LOAN" && (
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
                            <span className="material-symbols-outlined text-[14px]">
                              verified_user
                            </span>
                            {t("taxBenefit", {
                              amount: calculateTaxSaving(
                                debt.outstandingBalance *
                                  ((debt.interestRate || 3.0) / 100),
                                snapshot.grossMonthlyIncome * 12
                              ).toLocaleString(),
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full sm:w-auto gap-8 pl-[72px] sm:pl-0">
                      <div className="flex flex-col items-start sm:items-end">
                        <p className="text-error text-base font-bold">
                          -{debt.monthlyInstallment?.toLocaleString() || 0} THB
                        </p>
                        <span className="text-text-secondary text-xs uppercase tracking-wider font-medium">
                          Monthly
                        </span>

                        {/* Refinance Check Button (Home Loan Only) */}
                        {debt.type === "HOME_LOAN" && (
                          <button
                            onClick={() => setCheckingRefinanceDebt(debt)}
                            className="mt-1 text-xs text-primary underline decoration-primary/50 hover:decoration-primary underline-offset-2 transition-all"
                          >
                            Check Refinance
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingDebt(debt)}
                          className="text-text-secondary hover:text-primary p-2 rounded-lg hover:bg-surface-hover transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                          title="Edit debt"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => removeDebt(debt.id)}
                          className="text-text-secondary hover:text-error p-2 rounded-lg hover:bg-surface-hover transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                          title="Delete debt"
                        >
                          <span className="material-symbols-outlined">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            <div className="bg-surface-secondary border-t border-border-primary px-6 py-4 rounded-b-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-text-muted text-sm font-medium">
                  Showing {snapshot.debts.length} liabilities
                </p>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-text-muted uppercase tracking-wide">
                      Total Outstanding
                    </p>
                    <p className="text-text-primary font-bold">
                      {totalDebt.toLocaleString()} THB
                    </p>
                  </div>
                  <div className="h-8 w-px bg-border-primary"></div>
                  <div className="text-right">
                    <p className="text-xs text-text-muted uppercase tracking-wide">
                      Total Burden
                    </p>
                    <p className="text-primary font-bold text-lg">
                      {Math.round(totalMonthlyObligation).toLocaleString()} THB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payoff Calculator Section */}
          {snapshot.debts.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-text-primary text-2xl font-bold tracking-tight flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">
                      timeline
                    </span>
                    {t("payoffPlanner")}
                  </h2>
                  <p className="text-text-secondary text-sm mt-1">
                    Plan your debt-free journey with smart payoff strategies
                  </p>
                </div>
                <button
                  onClick={() => setShowPayoffCalculator(!showPayoffCalculator)}
                  className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-surface-hover"
                >
                  <span className="material-symbols-outlined">
                    {showPayoffCalculator ? "expand_less" : "expand_more"}
                  </span>
                </button>
              </div>

              {showPayoffCalculator && (
                <div className="animate-fade-in-up">
                  <PayoffCalculator debts={snapshot.debts} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {isAddModalOpen && (
        <AddDebtForm
          onClose={() => setIsAddModalOpen(false)}
          onSave={async (debt) => {
            addDebt(debt);
          }}
        />
      )}

      {isImportModalOpen && (
        <ImportModal
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImport}
        />
      )}

      {editingDebt && (
        <EditDebtForm
          debt={editingDebt}
          onClose={() => setEditingDebt(null)}
          onSave={async (id, updates) => {
            await updateDebt(id, updates);
          }}
        />
      )}

      {/* Refinance Calculator Modal */}
      {checkingRefinanceDebt && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[4px] transition-opacity"
            onClick={() => setCheckingRefinanceDebt(null)}
          ></div>
          <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl shadow-2xl transition-all">
            <RefinanceCalculator
              debt={checkingRefinanceDebt}
              onClose={() => setCheckingRefinanceDebt(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
