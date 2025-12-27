export interface FinancialGoal {
  id: string;
  type: "dsr_target" | "debt_free" | "save_amount" | "pay_off_debt";
  title: string;
  target: number;
  current: number;
  deadline?: Date;
  status: "on_track" | "behind" | "achieved";
  createdAt: Date;
  debtId?: string; // For pay_off_debt goals
}

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  snapshot: import("./types").UserSnapshot;
  createdAt: Date;
  updatedAt: Date;
}

export interface HistoricalSnapshot {
  id: string;
  timestamp: Date;
  snapshot: import("./types").UserSnapshot;
  dsr: number;
  totalDebt: number;
  monthlyObligation: number;
}
