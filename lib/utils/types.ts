export type DebtType =
  | "CREDIT_CARD"
  | "PERSONAL_LOAN"
  | "CAR_LOAN"
  | "HOME_LOAN"
  | "OTHER";

export interface Debt {
  id: string;
  lenderName: string;
  type: DebtType;
  outstandingBalance: number;
  creditLimit?: number;
  monthlyInstallment?: number;
  installmentPeriod?: number; // e.g. 12, 24, 60
  installmentUnit?: "MONTHS" | "YEARS" | "NONE"; // Defaults to MONTHS or NONE
  interestRate?: number; // Annual interest rate in %
}

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
}

export interface UserSnapshot {
  grossMonthlyIncome: number;
  additionalIncomes: IncomeSource[];
  debts: Debt[];
}

export interface DSRResult {
  totalMonthlyObligation: number;
  dsrPercent: number;
  isHealthy: boolean;
  status: "HEALTHY" | "WARNING" | "CRITICAL";
  totalDebt: number;
}
