export type GoalType =
  | "EMERGENCY_FUND"
  | "DEBT_FREE"
  | "SAVINGS"
  | "DSR_TARGET"
  | "CUSTOM";

export type GoalStatus = "ACTIVE" | "COMPLETED" | "PAUSED";

export interface Milestone {
  id: string;
  amount: number;
  label: string;
  reached: boolean;
}

export interface FinancialGoal {
  id: string;
  type: GoalType;
  title: string;
  description?: string;
  targetAmount?: number;
  targetDSR?: number;
  targetDate: string;
  currentAmount?: number;
  currentProgress: number; // 0-100
  milestones?: Milestone[];
  status: GoalStatus;
  createdAt: number;
  completedAt?: number;
}

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  EMERGENCY_FUND: "Emergency Fund",
  DEBT_FREE: "Debt Free",
  SAVINGS: "Savings Goal",
  DSR_TARGET: "DSR Target",
  CUSTOM: "Custom Goal",
};

export const GOAL_TYPE_ICONS: Record<GoalType, string> = {
  EMERGENCY_FUND: "emergency",
  DEBT_FREE: "paid",
  SAVINGS: "savings",
  DSR_TARGET: "trending_down",
  CUSTOM: "flag",
};
