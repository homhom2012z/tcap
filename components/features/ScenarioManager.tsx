"use client";

import { useState } from "react";
import type { Scenario } from "@/lib/utils/advancedTypes";
import { useScenarios } from "@/lib/hooks/useScenarios";
import { format } from "date-fns";
import { useTranslations } from "@/lib/contexts/LanguageContext";
import { useToast } from "@/lib/contexts/ToastContext";

interface ScenarioManagerProps {
  onLoadScenario: (scenario: Scenario) => void;
}

export default function ScenarioManager({
  onLoadScenario,
}: ScenarioManagerProps) {
  const { scenarios, deleteScenario, renameScenario } = useScenarios();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const t = useTranslations("simulator");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();

  // Confirmation Modals State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [showLoadConfirm, setShowLoadConfirm] = useState<Scenario | null>(null);

  const handleDelete = (id: string) => {
    deleteScenario(id);
    setShowDeleteConfirm(null);
    showToast("Scenario deleted successfully", "success");
  };

  const handleStartEdit = (scenario: Scenario) => {
    setEditingId(scenario.id);
    setEditName(scenario.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      renameScenario(editingId, editName.trim());
      setEditingId(null);
    }
  };

  const handleLoad = (scenario: Scenario) => {
    onLoadScenario(scenario);
    setShowLoadConfirm(null);
  };

  if (scenarios.length === 0) {
    return (
      <div className="text-center py-12 rounded-2xl bg-surface-primary border border-white/5 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-gray-500 text-[32px]">
            bookmark_border
          </span>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">
          {t("noScenarios")}
        </h3>
        <p className="text-gray-400 max-w-sm mx-auto">
          {t("saveScenarioDescription")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 animate-fade-in-up">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className="group relative overflow-hidden rounded-xl bg-surface-primary border border-white/5 transition-all hover:bg-surface-hover hover:border-white/10"
          >
            <div className="flex items-start justify-between p-5 gap-4">
              <div className="flex-1 min-w-0">
                {editingId === scenario.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-black/40 border border-primary/50 rounded px-2 py-1 text-white text-lg font-bold outline-none ring-1 ring-primary w-full"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="p-1 text-primary hover:bg-white/10 rounded"
                      title={t("rename")}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        check
                      </span>
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-red-400 hover:bg-white/10 rounded"
                      title={tCommon("cancel")}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        close
                      </span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white truncate">
                        {scenario.name}
                      </h3>
                      <button
                        onClick={() => handleStartEdit(scenario)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-white transition-opacity"
                        title={t("rename")}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          edit
                        </span>
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 font-medium mb-3">
                      {scenario.description || "No description"}
                    </p>
                  </>
                )}

                <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-mono">
                  <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded">
                    <span className="material-symbols-outlined text-[14px]">
                      calendar_today
                    </span>
                    {format(scenario.createdAt, "MMM d, yyyy")}
                  </div>

                  {/* DSR Preview Badge */}
                  {(() => {
                    // Quick DSR Calc for preview
                    const totalObligation = scenario.snapshot.debts.reduce(
                      (sum, d) => sum + (d.monthlyInstallment || 0),
                      0
                    );
                    const dsr =
                      scenario.snapshot.grossMonthlyIncome > 0
                        ? (totalObligation /
                            scenario.snapshot.grossMonthlyIncome) *
                          100
                        : 0;
                    const isHigh = dsr > 40;
                    return (
                      <div
                        className={`flex items-center gap-1.5 px-2 py-1 rounded border ${
                          isHigh
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          pie_chart
                        </span>
                        DSR: {Math.round(dsr)}%
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowLoadConfirm(scenario)}
                  className="px-4 py-2 bg-transparent border border-primary/20 hover:border-primary text-primary rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 hover:bg-primary/5 hover:shadow-[0_0_10px_rgba(16,183,127,0.1)]"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    upload
                  </span>
                  {t("load")}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(scenario.id)}
                  className="px-4 py-2 bg-transparent border border-white/10 hover:border-red-400/50 text-gray-400 hover:text-red-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 hover:bg-red-400/5"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                  {t("delete")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load Confirmation Modal */}
      {showLoadConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowLoadConfirm(null)}
          ></div>
          <div className="relative glass-panel rounded-2xl p-6 max-w-sm w-full border border-white/10 shadow-2xl animate-fade-in-up">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
              <span className="material-symbols-outlined text-[28px]">
                upload
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {t("load")} Scenario?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              This will load <strong>"{showLoadConfirm.name}"</strong> into the
              simulator. Current input values will be replaced.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLoadConfirm(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                {tCommon("cancel")}
              </button>
              <button
                onClick={() => handleLoad(showLoadConfirm)}
                className="px-5 py-2 bg-primary text-black font-bold rounded-lg shadow-[0_0_15px_rgba(16,183,127,0.3)] hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(16,183,127,0.5)] transition-all"
              >
                {t("load")} Scenario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(null)}
          ></div>
          <div className="relative glass-panel rounded-2xl p-6 max-w-sm w-full border border-white/10 shadow-2xl animate-fade-in-up">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500">
              <span className="material-symbols-outlined text-[28px]">
                delete
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {t("delete")} Scenario?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to delete this scenario? This action cannot
              be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                {tCommon("cancel")}
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-5 py-2 bg-red-500 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:bg-red-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
