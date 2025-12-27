"use client";

import { useState } from "react";
import Link from "next/link";
import { useUserSnapshot } from "@/lib/hooks/useUserSnapshot";
import { useScenarios } from "@/lib/hooks/useScenarios";
import SimulatorInput from "@/components/features/simulator/SimulatorInput";
import SimulatorResults from "@/components/features/simulator/SimulatorResults";
import SimulatorComparison from "@/components/features/simulator/SimulatorComparison";
import ScenarioManager from "@/components/features/ScenarioManager";
import ScenarioComparison from "@/components/features/ScenarioComparison";
import NavBar from "@/components/layout/NavBar";
import type { Scenario } from "@/lib/utils/advancedTypes";
import { useTranslations } from "@/lib/contexts/LanguageContext";
import { useToast } from "@/lib/contexts/ToastContext";

type ViewMode =
  | "INPUT"
  | "RESULTS"
  | "COMPARISON"
  | "SCENARIOS"
  | "COMPARE_SCENARIOS";

export default function SimulatorPage() {
  const { snapshot } = useUserSnapshot();
  const { saveScenario } = useScenarios();
  const t = useTranslations("simulator");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("INPUT");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [scenarioName, setScenarioName] = useState("");

  // State lifted from Input
  const [loanType, setLoanType] = useState("personal");
  const [loanAmount, setLoanAmount] = useState(500000);
  const [tenureYears, setTenureYears] = useState(3);
  const [interestRate, setInterestRate] = useState(7.5);

  const handleRunSimulation = () => {
    setViewMode("RESULTS");
  };

  const handleCompare = () => {
    setViewMode("COMPARISON");
  };

  const handleReset = () => {
    setViewMode("INPUT");
  };

  const handleSaveScenario = () => {
    if (scenarioName.trim()) {
      saveScenario(
        snapshot,
        scenarioName.trim(),
        `Simulated loan: ฿${loanAmount.toLocaleString()} @ ${interestRate}% for ${tenureYears}y`,
        // Pass current simulation inputs
        {
          loanAmount,
          interestRate,
          tenureYears,
        }
      );
      setShowSaveDialog(false);
      setScenarioName("");
      setViewMode("SCENARIOS");
    }
  };

  const handleLoadScenario = (scenario: Scenario) => {
    // Note: Full snapshot loading would require updating income and debts
    // For now, we just show a message that this is view-only
    showToast(
      "Scenario loaded for viewing. To apply changes, update your income and debts manually.",
      "info"
    );
    setViewMode("INPUT");
  };

  return (
    <div className="bg-bg-primary text-text-primary font-display min-h-screen flex flex-col overflow-x-hidden selection:bg-primary selection:text-white transition-colors duration-300">
      {/* Background Decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] mix-blend-screen"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <NavBar />

        {/* Main Content */}
        <main className="flex-grow pt-10 pb-12 px-6">
          {/* View Mode Tabs */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="flex flex-col gap-2 border-b border-border-primary pb-1">
              <button
                onClick={() => setViewMode("INPUT")}
                className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                  viewMode === "INPUT"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                {tNav("simulator")}
              </button>
              <button
                onClick={() => setViewMode("SCENARIOS")}
                className={`px-4 py-2 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  viewMode === "SCENARIOS"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  bookmark
                </span>
                {t("savedScenarios")}
              </button>
              <button
                onClick={() => setViewMode("COMPARE_SCENARIOS")}
                className={`px-4 py-2 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  viewMode === "COMPARE_SCENARIOS"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  compare_arrows
                </span>
                {t("compare")}
              </button>
            </div>
          </div>

          {viewMode === "INPUT" && (
            <div>
              {/* Save Scenario Button */}
              <div className="max-w-6xl mx-auto mb-6 flex justify-end">
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-surface-hover hover:bg-surface-primary border border-border-primary text-text-primary rounded-lg transition-colors text-sm font-medium"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    bookmark_add
                  </span>
                  Save Current State
                </button>
              </div>

              <SimulatorInput
                snapshot={snapshot}
                loanType={loanType}
                setLoanType={setLoanType}
                loanAmount={loanAmount}
                setLoanAmount={setLoanAmount}
                tenureYears={tenureYears}
                setTenureYears={setTenureYears}
                interestRate={interestRate}
                setInterestRate={setInterestRate}
                onRunSimulation={handleRunSimulation}
                onSaveScenario={() => setShowSaveDialog(true)}
              />
            </div>
          )}

          {viewMode === "RESULTS" && (
            <SimulatorResults
              snapshot={snapshot}
              loanAmount={loanAmount}
              tenureYears={tenureYears}
              interestRate={interestRate}
              onReset={handleReset}
              onCompare={handleCompare}
              onSaveScenario={() => setShowSaveDialog(true)}
            />
          )}

          {viewMode === "COMPARISON" && (
            <SimulatorComparison
              snapshot={snapshot}
              scenarioA={{
                amount: loanAmount,
                tenure: tenureYears,
                rate: interestRate,
              }}
              scenarioB={{
                amount: loanAmount,
                tenure: tenureYears + 2,
                rate: interestRate,
              }} // Simple logic: +2 years
              onBack={handleReset}
            />
          )}

          {viewMode === "SCENARIOS" && (
            <div className="max-w-4xl mx-auto">
              <ScenarioManager onLoadScenario={handleLoadScenario} />
            </div>
          )}

          {viewMode === "COMPARE_SCENARIOS" && (
            <div className="max-w-6xl mx-auto">
              <ScenarioComparison />
            </div>
          )}
        </main>

        {/* Save Scenario Dialog */}
        {showSaveDialog && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSaveDialog(false)}
            ></div>

            <div className="relative glass-panel rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl">
              <h3 className="text-text-primary font-bold text-lg mb-4">
                {t("saveScenario")}
              </h3>

              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveScenario();
                  if (e.key === "Escape") setShowSaveDialog(false);
                }}
                placeholder={t("enterName")}
                className="w-full px-4 py-3 rounded-lg bg-surface-secondary border border-border-primary text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none mb-4"
                autoFocus
              />

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {tCommon("cancel")}
                </button>
                <button
                  onClick={handleSaveScenario}
                  disabled={!scenarioName.trim()}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-text-inverse rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("saveScenario")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
