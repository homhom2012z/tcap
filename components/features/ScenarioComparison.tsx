"use client";

import { useState } from "react";
import { useScenarios } from "@/lib/hooks/useScenarios";
import { calculateDSR } from "@/lib/utils/calculator";
import type { Scenario } from "@/lib/utils/advancedTypes";

export default function ScenarioComparison() {
  const { scenarios } = useScenarios();
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);

  const handleToggleScenario = (id: string) => {
    if (selectedScenarios.includes(id)) {
      setSelectedScenarios(selectedScenarios.filter((sid) => sid !== id));
    } else {
      if (selectedScenarios.length < 3) {
        setSelectedScenarios([...selectedScenarios, id]);
      }
    }
  };

  const comparedScenarios = selectedScenarios
    .map((id) => scenarios.find((s) => s.id === id))
    .filter((s): s is Scenario => s !== undefined);

  if (scenarios.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <span className="material-symbols-outlined text-text-muted text-6xl mb-4">
          compare
        </span>
        <h3 className="text-text-primary font-bold text-xl mb-2">
          No Scenarios to Compare
        </h3>
        <p className="text-text-secondary">
          Save at least 2 scenarios to use the comparison feature
        </p>
      </div>
    );
  }

  if (scenarios.length < 2) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <span className="material-symbols-outlined text-text-muted text-6xl mb-4">
          compare
        </span>
        <h3 className="text-text-primary font-bold text-xl mb-2">
          Need More Scenarios
        </h3>
        <p className="text-text-secondary">
          You have {scenarios.length} scenario. Save at least one more to
          compare.
        </p>
      </div>
    );
  }

  const getMetricColor = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return "text-primary";
    if (value <= thresholds[1]) return "text-amber-500";
    return "text-red-500";
  };

  const getBestScenario = () => {
    if (comparedScenarios.length < 2) return null;

    const scenariosWithDSR = comparedScenarios.map((s) => ({
      scenario: s,
      dsr: calculateDSR(s.snapshot).dsrPercent,
    }));

    return scenariosWithDSR.reduce((best, current) =>
      current.dsr < best.dsr ? current : best
    ).scenario.id;
  };

  const bestScenarioId = getBestScenario();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-text-primary font-bold text-2xl mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            compare_arrows
          </span>
          Compare Scenarios
        </h2>
        <p className="text-text-secondary text-sm">
          Select 2-3 scenarios to compare side-by-side
        </p>
      </div>

      {/* Scenario Selector */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-text-primary font-semibold mb-3">
          Select Scenarios ({selectedScenarios.length}/3)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {scenarios.map((scenario) => {
            const isSelected = selectedScenarios.includes(scenario.id);
            const { dsrPercent } = calculateDSR(scenario.snapshot);

            return (
              <button
                key={scenario.id}
                onClick={() => handleToggleScenario(scenario.id)}
                disabled={!isSelected && selectedScenarios.length >= 3}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border-primary hover:border-primary/50 bg-surface-secondary"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-text-primary font-medium text-sm truncate flex-1">
                    {scenario.name}
                  </h4>
                  {isSelected && (
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      check_circle
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-text-secondary">DSR:</span>
                  <span
                    className={`font-bold ${getMetricColor(
                      dsrPercent,
                      [40, 60]
                    )}`}
                  >
                    {Math.round(dsrPercent)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      {comparedScenarios.length >= 2 && (
        <div className="glass-card rounded-xl p-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-primary">
                <th className="text-left py-3 px-2 text-text-secondary text-sm font-medium">
                  Metric
                </th>
                {comparedScenarios.map((scenario) => (
                  <th
                    key={scenario.id}
                    className="text-center py-3 px-2 min-w-[150px]"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-text-primary font-semibold">
                        {scenario.name}
                      </span>
                      {bestScenarioId === scenario.id && (
                        <span className="text-primary text-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            emoji_events
                          </span>
                          Best DSR
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* DSR */}
              <tr className="border-b border-border-primary/50">
                <td className="py-3 px-2 text-text-primary font-medium">
                  Debt Service Ratio
                </td>
                {comparedScenarios.map((scenario) => {
                  const { dsrPercent } = calculateDSR(scenario.snapshot);
                  return (
                    <td key={scenario.id} className="py-3 px-2 text-center">
                      <span
                        className={`text-xl font-bold ${getMetricColor(
                          dsrPercent,
                          [40, 60]
                        )}`}
                      >
                        {Math.round(dsrPercent)}%
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Total Debt */}
              <tr className="border-b border-border-primary/50">
                <td className="py-3 px-2 text-text-primary font-medium">
                  Total Debt
                </td>
                {comparedScenarios.map((scenario) => {
                  // Find the simulated loan debt
                  const simulatedDebt = scenario.snapshot.debts.find((d) =>
                    d.id.startsWith("simulated-loan-")
                  );
                  const loanAmount = simulatedDebt?.outstandingBalance || 0;

                  return (
                    <td
                      key={scenario.id}
                      className="py-3 px-2 text-center text-text-primary font-mono"
                    >
                      ฿{loanAmount.toLocaleString()}
                    </td>
                  );
                })}
              </tr>

              {/* Monthly Obligation */}
              <tr className="border-b border-border-primary/50">
                <td className="py-3 px-2 text-text-primary font-medium">
                  Monthly Payment
                </td>
                {comparedScenarios.map((scenario) => {
                  // Find the simulated loan debt (not existing debts)
                  const simulatedDebt = scenario.snapshot.debts.find((d) =>
                    d.id.startsWith("simulated-loan-")
                  );
                  const monthlyPayment = simulatedDebt?.monthlyInstallment || 0;

                  return (
                    <td
                      key={scenario.id}
                      className="py-3 px-2 text-center text-text-primary font-mono"
                    >
                      ฿{monthlyPayment.toLocaleString()}
                    </td>
                  );
                })}
              </tr>

              {/* Income */}
              <tr className="border-b border-border-primary/50">
                <td className="py-3 px-2 text-text-primary font-medium">
                  Monthly Income
                </td>
                {comparedScenarios.map((scenario) => (
                  <td
                    key={scenario.id}
                    className="py-3 px-2 text-center text-text-primary font-mono"
                  >
                    ฿{scenario.snapshot.grossMonthlyIncome.toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Free Cash Flow */}
              <tr className="border-b border-border-primary/50">
                <td className="py-3 px-2 text-text-primary font-medium">
                  Free Cash Flow
                </td>
                {comparedScenarios.map((scenario) => {
                  const { totalMonthlyObligation } = calculateDSR(
                    scenario.snapshot
                  );
                  const freeCash =
                    scenario.snapshot.grossMonthlyIncome -
                    totalMonthlyObligation;
                  return (
                    <td key={scenario.id} className="py-3 px-2 text-center">
                      <span
                        className={`font-mono font-bold ${
                          freeCash > 0 ? "text-primary" : "text-red-500"
                        }`}
                      >
                        ฿{freeCash.toLocaleString()}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Number of Debts */}
              <tr>
                <td className="py-3 px-2 text-text-primary font-medium">
                  Number of Debts
                </td>
                {comparedScenarios.map((scenario) => (
                  <td
                    key={scenario.id}
                    className="py-3 px-2 text-center text-text-primary"
                  >
                    {scenario.snapshot.debts.length}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Recommendation */}
      {comparedScenarios.length >= 2 && bestScenarioId && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">
              lightbulb
            </span>
            <div>
              <h4 className="text-primary font-bold mb-1">Recommendation</h4>
              <p className="text-text-primary text-sm">
                <span className="font-semibold">
                  {comparedScenarios.find((s) => s.id === bestScenarioId)?.name}
                </span>{" "}
                has the lowest DSR, indicating better financial flexibility and
                lower debt burden relative to income.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
