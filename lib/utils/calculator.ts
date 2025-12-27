import type { Debt, DSRResult, UserSnapshot } from "./types";

const CREDIT_CARD_MIN_PAYMENT_RATE = 0.08;
const PERSONAL_LOAN_MIN_PAYMENT_RATE = 0.05;

export const calculateLoanInstallment = (
  principal: number,
  annualRate: number,
  years: number
): number => {
  if (principal <= 0 || years <= 0) return 0;
  if (annualRate <= 0) return Math.ceil(principal / (years * 12));

  const r = annualRate / 100 / 12;
  const n = years * 12;

  const numerator = principal * r * Math.pow(1 + r, n);
  const denominator = Math.pow(1 + r, n) - 1;

  return Math.ceil(numerator / denominator);
};

export const calculateMonthlyObligation = (debt: Debt): number => {
  if (debt.monthlyInstallment && debt.monthlyInstallment > 0) {
    if (
      debt.type === "CAR_LOAN" ||
      debt.type === "HOME_LOAN" ||
      debt.type === "OTHER"
    ) {
      return debt.monthlyInstallment;
    }
  }

  switch (debt.type) {
    case "CREDIT_CARD":
      return Math.ceil(debt.outstandingBalance * CREDIT_CARD_MIN_PAYMENT_RATE);
    case "PERSONAL_LOAN":
      return Math.ceil(
        debt.outstandingBalance * PERSONAL_LOAN_MIN_PAYMENT_RATE
      );
    default:
      return debt.monthlyInstallment || 0;
  }
};

export const calculateDSR = (snapshot: UserSnapshot): DSRResult => {
  const { grossMonthlyIncome, debts } = snapshot;

  if (grossMonthlyIncome <= 0) {
    return {
      totalMonthlyObligation: 0,
      dsrPercent: 0,
      isHealthy: true,
      status: "HEALTHY",
      totalDebt: 0,
    };
  }

  const totalMonthlyObligation = debts.reduce((sum, debt) => {
    return sum + calculateMonthlyObligation(debt);
  }, 0);

  const totalDebt = debts.reduce(
    (sum, debt) => sum + debt.outstandingBalance,
    0
  );

  const dsrPercent =
    snapshot.grossMonthlyIncome > 0
      ? (totalMonthlyObligation / snapshot.grossMonthlyIncome) * 100
      : 0;
  const roundedDsr = Math.round(dsrPercent * 100) / 100;

  // Dynamic DSR Thresholds based on Bank Standards
  let warningThreshold = 40;
  let criticalThreshold = 50;

  if (grossMonthlyIncome > 70000) {
    warningThreshold = 60;
    criticalThreshold = 70;
  } else if (grossMonthlyIncome >= 30000) {
    warningThreshold = 50;
    criticalThreshold = 60;
  }

  let status: DSRResult["status"] = "HEALTHY";
  if (roundedDsr > criticalThreshold) {
    status = "CRITICAL";
  } else if (roundedDsr > warningThreshold) {
    status = "WARNING";
  }

  return {
    totalMonthlyObligation,
    dsrPercent: roundedDsr,
    isHealthy: status === "HEALTHY",
    status,
    totalDebt,
  };
};

export const calculateTaxSaving = (
  annualHomeInterest: number,
  annualIncome: number
): number => {
  // Thai Personal Income Tax Brackets (2024)
  // Net Income -> Tax Rate
  // 0 - 150,000 -> 0%
  // 150,001 - 300,000 -> 5%
  // 300,001 - 500,000 -> 10%
  // 500,001 - 750,000 -> 15%
  // 750,001 - 1,000,000 -> 20%
  // 1,000,001 - 2,000,000 -> 25%
  // 2,000,001 - 5,000,000 -> 30%
  // > 5,000,000 -> 35%

  if (annualHomeInterest <= 0 || annualIncome <= 0) return 0;

  // Max deduction for home loan interest is 100,000 THB
  const deductibleAmount = Math.min(annualHomeInterest, 100000);

  // Simplified calculation using marginal tax rate
  // This assumes the deduction applies to the highest bracket
  // For exact calculation we would need calculateTax(income) - calculateTax(income - deduction)

  // Standard deduction (Expense 50% max 100k + Personal 60k)
  // We'll estimate "Net Taxable Income" roughly as Income - 160,000
  // This is a rough estimation for the "Preview" badge
  const estimatedNetIncome = Math.max(0, annualIncome - 160000);

  let marginalRate = 0;
  if (estimatedNetIncome > 5000000) marginalRate = 0.35;
  else if (estimatedNetIncome > 2000000) marginalRate = 0.3;
  else if (estimatedNetIncome > 1000000) marginalRate = 0.25;
  else if (estimatedNetIncome > 750000) marginalRate = 0.2;
  else if (estimatedNetIncome > 500000) marginalRate = 0.15;
  else if (estimatedNetIncome > 300000) marginalRate = 0.1;
  else if (estimatedNetIncome > 150000) marginalRate = 0.05;

  return Math.floor(deductibleAmount * marginalRate);
};

export interface RefinanceResult {
  refinanceCost: number;
  monthlySavingRefi: number;
  monthlySavingRetention: number;
  breakEvenMonths: number;
  totalSaving3YearsRefi: number;
  totalSaving3YearsRetention: number;
  recommendation: "REFINANCE" | "RETENTION" | "WAIT";
}

export const calculateRefinanceComparison = (
  outstandingBalance: number,
  currentRate: number,
  newRateRefi: number,
  newRateRetention: number,
  remainingMonths: number
): RefinanceResult => {
  // 1. Calculate Costs (Thai Standard)
  // Mortgage Registration Fee: 1% of loan amount
  const mortgageFee = outstandingBalance * 0.01;
  // Stamp Duty: 0.05% of loan amount (Max 10,000)
  const stampDuty = Math.min(outstandingBalance * 0.0005, 10000);
  // Values Fee (Est)
  const valuationFee = 3000;

  const refinanceCost = mortgageFee + stampDuty + valuationFee;

  // 2. Calculate Monthly Installment (Approx)
  // Using PMT formula simplified for interest comparison
  // Actually, we care about Interest Saving.
  // Monthly Installment might change if term changes, but let's assume term stays same.

  const rCurrent = currentRate / 100 / 12;
  const rRefi = newRateRefi / 100 / 12;
  const rRetention = newRateRetention / 100 / 12;

  const pmtCurrent =
    (outstandingBalance * rCurrent) /
    (1 - Math.pow(1 + rCurrent, -remainingMonths));
  const pmtRefi =
    (outstandingBalance * rRefi) / (1 - Math.pow(1 + rRefi, -remainingMonths));
  const pmtRetention =
    (outstandingBalance * rRetention) /
    (1 - Math.pow(1 + rRetention, -remainingMonths));

  const monthlySavingRefi = pmtCurrent - pmtRefi;
  const monthlySavingRetention = pmtCurrent - pmtRetention;

  // 3. Break Even Point (Refi)
  // Cost / Monthly Saving
  const breakEvenMonths =
    monthlySavingRefi > 0 ? refinanceCost / monthlySavingRefi : 999;

  // 4. 3-Year Saving (36 Months)
  // Total Saving - Cost
  const totalSaving3YearsRefi = monthlySavingRefi * 36 - refinanceCost;
  const totalSaving3YearsRetention = monthlySavingRetention * 36; // Retention usually has 0 cost

  // 5. Recommendation
  let recommendation: "REFINANCE" | "RETENTION" | "WAIT" = "WAIT";

  if (
    totalSaving3YearsRefi > totalSaving3YearsRetention &&
    totalSaving3YearsRefi > 0
  ) {
    recommendation = "REFINANCE";
  } else if (totalSaving3YearsRetention > 0) {
    recommendation = "RETENTION";
  }

  return {
    refinanceCost,
    monthlySavingRefi,
    monthlySavingRetention,
    breakEvenMonths,
    totalSaving3YearsRefi,
    totalSaving3YearsRetention,
    recommendation,
  };
};

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export const calculateAmortizationSchedule = (
  principal: number,
  annualRate: number,
  years: number
): AmortizationRow[] => {
  if (principal <= 0 || years <= 0) return [];

  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = years * 12;
  let balance = principal;
  const schedule: AmortizationRow[] = [];

  // Calculate fixed monthly payment
  let monthlyPayment = 0;
  if (annualRate === 0) {
    monthlyPayment = principal / totalMonths;
  } else {
    monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  for (let i = 1; i <= totalMonths; i++) {
    const interest = balance * monthlyRate;
    const principalPayment = monthlyPayment - interest;
    balance -= principalPayment;

    // Handle last month rounding issues
    if (i === totalMonths && Math.abs(balance) < 1) {
      balance = 0;
    }

    schedule.push({
      month: i,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interest,
      balance: Math.max(0, balance),
    });
  }

  return schedule;
};
