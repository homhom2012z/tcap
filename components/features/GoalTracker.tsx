"use client";

import type { FinancialGoal } from "@/lib/utils/advancedTypes";

interface GoalTrackerProps {
  goals: FinancialGoal[];
  onDelete?: (id: string) => void;
}

export default function GoalTracker({ goals, onDelete }: GoalTrackerProps) {
  if (goals.length === 0) {
    return null;
  }

  const getProgressPercentage = (goal: FinancialGoal) => {
    if (goal.type === "dsr_target") {
      // For DSR, lower is better
      if (goal.current <= goal.target) return 100;
      return Math.max(
        0,
        100 - ((goal.current - goal.target) / goal.target) * 100
      );
    }
    if (goal.type === "debt_free") {
      // For debt free, we want to reach 0
      if (goal.current === 0) return 100;
      const initialDebt = goal.target || goal.current;
      return Math.max(0, ((initialDebt - goal.current) / initialDebt) * 100);
    }
    return (goal.current / goal.target) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "achieved":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "on_track":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "behind":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      default:
        return "text-text-secondary bg-gray-500/10 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">flag</span>
        Financial Goals
      </h3>

      <div className="grid gap-4">
        {goals.map((goal) => {
          const progress = getProgressPercentage(goal);

          return (
            <div key={goal.id} className="glass-card rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">
                    {goal.title}
                  </h4>
                  <div
                    className={`text-xs px-2 py-1 rounded-full border inline-block ${getStatusColor(
                      goal.status
                    )}`}
                  >
                    {goal.status.replace("_", " ")}
                  </div>
                </div>
                {onDelete && (
                  <button
                    onClick={() => onDelete(goal.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Progress</span>
                  <span className="text-white font-medium">
                    {Math.round(progress)}%
                  </span>
                </div>

                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    Current:{" "}
                    {goal.current.toFixed(goal.type === "dsr_target" ? 1 : 0)}
                  </span>
                  <span>
                    Target:{" "}
                    {goal.target.toFixed(goal.type === "dsr_target" ? 1 : 0)}
                  </span>
                </div>

                {goal.deadline && (
                  <div className="text-xs text-text-secondary flex items-center gap-1 mt-2">
                    <span className="material-symbols-outlined text-[14px]">
                      event
                    </span>
                    Deadline: {goal.deadline.toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
