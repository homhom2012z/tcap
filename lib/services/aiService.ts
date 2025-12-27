import { UserSnapshot } from "@/lib/utils/types";
import { calculateDSR } from "@/lib/utils/calculator";

export function formatFinancialContext(snapshot: UserSnapshot): string {
  const { totalMonthlyObligation, dsrPercent, totalDebt } =
    calculateDSR(snapshot);

  let context = `User Financial Snapshot:\n`;
  context += `- Gross Monthly Income: ${snapshot.grossMonthlyIncome.toLocaleString()} THB\n`;
  context += `- Total Debt: ${totalDebt.toLocaleString()} THB\n`;
  context += `- Monthly Debt Obligations: ${totalMonthlyObligation.toLocaleString()} THB\n`;
  context += `- DSR (Debt Service Ratio): ${dsrPercent.toFixed(1)}%\n`;

  if (snapshot.debts.length > 0) {
    context += `\nDebts List:\n`;
    snapshot.debts.forEach((d, i) => {
      context += `${i + 1}. ${d.lenderName} (${
        d.type
      }): ${d.outstandingBalance.toLocaleString()} THB (Monthly: ${
        d.monthlyInstallment?.toLocaleString() || "N/A"
      })\n`;
    });
  } else {
    context += `\nNo debts recorded.\n`;
  }

  return context;
}

export async function getMockAIResponse(
  message: string,
  context: string
): Promise<string> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("health") || lowerMsg.includes("status")) {
    if (
      context.includes("DSR") &&
      parseFloat(context.split("DSR (Debt Service Ratio): ")[1]) > 40
    ) {
      return "Based on your current data, your DSR is above the recommended 40%. I suggest focusing on paying down high-interest debts like credit cards first to improve your financial health.";
    }
    return "Your financial health looks stable! Your DSR is within the safe range. You might want to consider investment options or saving for an emergency fund.";
  }

  if (lowerMsg.includes("debt") || lowerMsg.includes("pay")) {
    return "To manage your debts effectively, consider the Avalanche method (paying highest interest first) to save money, or the Snowball method (paying smallest balance first) for quick wins. Which would you like to explore?";
  }

  return "I'm your AI Financial Advisor. I can analyze your current DSR, suggest payoff strategies, or help you plan for a new loan. How can I assist you today?";
}
