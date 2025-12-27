import type { UserSnapshot } from "./types";
import { calculateDSR } from "./calculator";

export interface Recommendation {
  id: string;
  type: "warning" | "info" | "success";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  action?: {
    label: string;
    route?: string;
  };
}

export function generateRecommendations(
  snapshot: UserSnapshot
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const { dsrPercent, totalDebt, totalMonthlyObligation } =
    calculateDSR(snapshot);
  const { debts, grossMonthlyIncome } = snapshot;

  // DSR Warning
  if (dsrPercent > 40) {
    recommendations.push({
      id: "high-dsr",
      type: "warning",
      priority: "high",
      title: "High Debt Service Ratio",
      description: `Your DSR is ${dsrPercent.toFixed(
        1
      )}%, which exceeds the recommended 40% limit. Consider debt consolidation or increasing income.`,
      action: {
        label: "View Simulator",
        route: "/simulator",
      },
    });
  } else if (dsrPercent > 30) {
    recommendations.push({
      id: "moderate-dsr",
      type: "info",
      priority: "medium",
      title: "Moderate DSR",
      description: `Your DSR is ${dsrPercent.toFixed(
        1
      )}%. You're approaching the 40% threshold. Monitor your debt levels closely.`,
    });
  } else {
    recommendations.push({
      id: "healthy-dsr",
      type: "success",
      priority: "low",
      title: "Healthy Financial Position",
      description: `Your DSR is ${dsrPercent.toFixed(
        1
      )}%, which is well within the safe range. Great job managing your finances!`,
    });
  }

  // High Interest Debt Alert
  const creditCards = debts.filter((d) => d.type === "CREDIT_CARD");
  if (creditCards.length > 0) {
    const totalCC = creditCards.reduce(
      (sum, d) => sum + d.outstandingBalance,
      0
    );
    if (totalCC > grossMonthlyIncome * 0.5) {
      recommendations.push({
        id: "high-cc-debt",
        type: "warning",
        priority: "high",
        title: "High Credit Card Debt",
        description: `You have ฿${totalCC.toLocaleString()} in credit card debt (typically 18-24% interest). Consider balance transfer or consolidation.`,
        action: {
          label: "View Liabilities",
          route: "/liabilities",
        },
      });
    }
  }

  // Debt Consolidation Suggestion
  if (debts.length > 3 && totalDebt > grossMonthlyIncome * 2) {
    recommendations.push({
      id: "consolidation",
      type: "info",
      priority: "medium",
      title: "Consider Debt Consolidation",
      description: `You have ${
        debts.length
      } active debts totaling ฿${totalDebt.toLocaleString()}. Consolidation could simplify payments and reduce interest.`,
    });
  }

  // Emergency Fund Recommendation
  if (totalMonthlyObligation / grossMonthlyIncome > 0.3) {
    recommendations.push({
      id: "emergency-fund",
      type: "info",
      priority: "medium",
      title: "Build Emergency Fund",
      description:
        "With significant debt obligations, having 3-6 months of expenses in savings is crucial for financial stability.",
    });
  }

  // Payoff Strategy Recommendation
  if (debts.length > 1) {
    recommendations.push({
      id: "payoff-strategy",
      type: "info",
      priority: "low",
      title: "Optimize Debt Payoff Strategy",
      description:
        "Consider using the avalanche method (highest interest first) or snowball method (smallest balance first) to pay off debts efficiently.",
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
