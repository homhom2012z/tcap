"use client";

import { useState } from "react";
import { parseCSVDebts, importBackup } from "@/lib/utils/import";
import { useUserSnapshot } from "@/lib/hooks/useUserSnapshot";
import { useToast } from "@/lib/contexts/ToastContext";
import type { Debt } from "@/lib/utils/types";
import FocusTrap from "@/components/accessibility/FocusTrap";

interface ImportDataModalProps {
  onClose: () => void;
}

export default function ImportDataModal({ onClose }: ImportDataModalProps) {
  const { addDebt } = useUserSnapshot();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [importType, setImportType] = useState<"csv" | "json">("csv");
  const [previewDebts, setPreviewDebts] = useState<Debt[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrors([]);
    setWarnings([]);
    setPreviewDebts([]);

    try {
      if (importType === "csv") {
        const result = await parseCSVDebts(file);

        if (result.errors.length > 0) {
          setErrors(result.errors);
        }
        if (result.warnings.length > 0) {
          setWarnings(result.warnings);
        }
        if (result.debts && result.debts.length > 0) {
          setPreviewDebts(result.debts);
        }
      } else {
        const text = await file.text();
        const result = importBackup(text);

        if (result.errors.length > 0) {
          setErrors(result.errors);
        }
        if (result.debts && result.debts.length > 0) {
          setPreviewDebts(result.debts);
        }
      }
    } catch (error) {
      setErrors([`Failed to process file: ${error}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (previewDebts.length === 0) return;

    setIsProcessing(true);
    try {
      for (const debt of previewDebts) {
        await addDebt(debt);
      }
      showToast(
        `Successfully imported ${previewDebts.length} debts!`,
        "success"
      );
      onClose();
    } catch (error) {
      showToast("Failed to import debts", "error");
      setErrors([`Import failed: ${error}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <FocusTrap active={true} onEscape={onClose}>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative glass-panel rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">
              Import Data
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Import Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Import Format
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setImportType("csv")}
                className={`flex-1 py-3 px-4 rounded-xl border transition-all ${
                  importType === "csv"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border-primary bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">table_chart</span>
                  <span className="font-semibold">CSV File</span>
                </div>
                <p className="text-xs mt-1">Import debts from spreadsheet</p>
              </button>
              <button
                onClick={() => setImportType("json")}
                className={`flex-1 py-3 px-4 rounded-xl border transition-all ${
                  importType === "json"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border-primary bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">backup</span>
                  <span className="font-semibold">JSON Backup</span>
                </div>
                <p className="text-xs mt-1">Restore full backup</p>
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Select File
            </label>
            <input
              type="file"
              accept={importType === "csv" ? ".csv" : ".json"}
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="w-full px-4 py-3 rounded-xl border border-border-primary bg-surface-secondary text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:font-semibold hover:file:bg-emerald-600 transition-all"
            />
            <p className="text-xs text-text-muted mt-2">
              {importType === "csv"
                ? "CSV format: lender, type, balance, payment"
                : "JSON backup file from previous export"}
            </p>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
                <span className="material-symbols-outlined">error</span>
                <span>Errors Found</span>
              </div>
              <ul className="text-sm text-red-300 space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="mb-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-2">
                <span className="material-symbols-outlined">warning</span>
                <span>Warnings</span>
              </div>
              <ul className="text-sm text-yellow-300 space-y-1">
                {warnings.map((warning, idx) => (
                  <li key={idx}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {previewDebts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                Preview ({previewDebts.length} debts)
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {previewDebts.map((debt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-surface-secondary border border-border-primary"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-text-primary">
                          {debt.lenderName}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {debt.type.replace("_", " ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-text-primary">
                          ฿{debt.outstandingBalance.toLocaleString()}
                        </p>
                        <p className="text-sm text-text-secondary">
                          ฿{(debt.monthlyInstallment || 0).toLocaleString()}/mo
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-border-primary bg-surface-secondary text-text-primary hover:bg-surface-hover transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={
                previewDebts.length === 0 || isProcessing || errors.length > 0
              }
              className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin material-symbols-outlined">
                    progress_activity
                  </span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">upload</span>
                  Import {previewDebts.length} Debts
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
