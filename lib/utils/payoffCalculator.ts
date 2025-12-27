import type { Debt } from "./types";

interface PayoffResult {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  debtName: string;
}

interface PayoffStrategy {
  method: "snowball" | "avalanche";
  timeline: PayoffResult[];
  totalInterest: number;
  totalMonths: number;
  totalPaid: number;
}

const AVERAGE_INTEREST_RATE = 0.18; // 18% annual for estimation

export function calculateSnowball(
  debts: Debt[],
  extraPayment: number = 0
): PayoffStrategy {
  const sortedDebts = [...debts].sort(
    (a, b) => a.outstandingBalance - b.outstandingBalance
  );
  return simulatePayoff(sortedDebts, extraPayment, "snowball");
}

export function calculateAvalanche(
  debts: Debt[],
  extraPayment: number = 0
): PayoffStrategy {
  // Sort by interest rate (we'll estimate based on type since we don't have actual rates)
  const sortedDebts = [...debts].sort((a, b) => {
    const rateA = getEstimatedRate(a.type);
    const rateB = getEstimatedRate(b.type);
    return rateB - rateA;
  });
  return simulatePayoff(sortedDebts, extraPayment, "avalanche");
}

function getEstimatedRate(type: string): number {
  switch (type) {
    case "CREDIT_CARD":
      return 0.24; // 24%
    case "PERSONAL_LOAN":
      return 0.15; // 15%
    case "CAR_LOAN":
      return 0.07; // 7%
    case "HOME_LOAN":
      return 0.04; // 4%
    default:
      return 0.18; // 18%
  }
}

function simulatePayoff(
  debts: Debt[],
  extraPayment: number,
  method: "snowball" | "avalanche"
): PayoffStrategy {
  const timeline: PayoffResult[] = [];
  let totalInterest = 0;
  let month = 0;

  // Clone debts with balances
  const activeDebts = debts.map((d) => ({
    ...d,
    balance: d.outstandingBalance,
    monthlyPayment: d.monthlyInstallment || d.outstandingBalance * 0.03, // 3% minimum
    rate: getEstimatedRate(d.type) / 12, // Monthly rate
  }));

  while (activeDebts.some((d) => d.balance > 0)) {
    month++;
    if (month > 600) break; // Safety limit (50 years)

    // Calculate minimum payments
    let availableExtra = extraPayment;

    // Pay minimums on all debts first
    activeDebts.forEach((debt) => {
      if (debt.balance > 0) {
        const interest = debt.balance * debt.rate;
        const principal = Math.min(
          debt.monthlyPayment - interest,
          debt.balance
        );
        const payment = interest + principal;

        debt.balance -= principal;
        totalInterest += interest;

        timeline.push({
          month,
          payment,
          principal,
          interest,
          balance: Math.max(0, debt.balance),
          debtName: debt.lenderName,
        });
      }
    });

    // Apply extra payment to target debt (first non-zero debt in sorted order)
    const targetDebt = activeDebts.find((d) => d.balance > 0);
    if (targetDebt && availableExtra > 0) {
      const extraPrincipal = Math.min(availableExtra, targetDebt.balance);
      targetDebt.balance -= extraPrincipal;

      // Add to timeline
      const lastEntry = timeline[timeline.length - 1];
      if (lastEntry) {
        lastEntry.principal += extraPrincipal;
        lastEntry.payment += extraPrincipal;
      }
    }
  }

  const totalPaid =
    debts.reduce((sum, d) => sum + d.outstandingBalance, 0) + totalInterest;

  return {
    method,
    timeline,
    totalInterest,
    totalMonths: month,
    totalPaid,
  };
}

export function compareStrategies(
  debts: Debt[],
  extraPayment: number = 0
): {
  snowball: PayoffStrategy;
  avalanche: PayoffStrategy;
  savings: number;
} {
  const snowball = calculateSnowball(debts, extraPayment);
  const avalanche = calculateAvalanche(debts, extraPayment);
  const savings = snowball.totalInterest - avalanche.totalInterest;

  return { snowball, avalanche, savings };
}
