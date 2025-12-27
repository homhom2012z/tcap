import type { Debt, DebtType, UserSnapshot } from "./types";

export function exportToCSV(snapshot: UserSnapshot) {
  const { debts, grossMonthlyIncome, additionalIncomes } = snapshot;

  // Create CSV content
  const headers = [
    "Category",
    "Type",
    "Name/Description",
    "Amount (THB)",
    "Monthly Payment",
  ];
  const rows: string[][] = [];

  // Add income section
  rows.push([
    "Income",
    "Salary",
    "Gross Monthly Salary",
    grossMonthlyIncome.toString(),
    "-",
  ]);
  additionalIncomes?.forEach((income) => {
    rows.push([
      "Income",
      "Additional",
      income.name,
      income.amount.toString(),
      "-",
    ]);
  });

  // Add debt section
  debts.forEach((debt) => {
    rows.push([
      "Debt",
      debt.type.replace("_", " "),
      debt.lenderName,
      debt.outstandingBalance.toString(),
      (debt.monthlyInstallment || 0).toString(),
    ]);
  });

  // Convert to CSV string
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  // Create download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `tcap-data-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function importFromCSV(file: File): Promise<{
  debts: Omit<Debt, "id">[];
  income?: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n");
        const debts: Omit<Debt, "id">[] = [];
        let income: number | undefined;

        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Parse CSV (handle quoted fields)
          const fields = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
          const cleanFields = fields.map((f) => f.replace(/^"|"$/g, ""));

          const [category, type, name, amount, monthly] = cleanFields;

          if (category === "Income" && type === "Salary") {
            income = parseFloat(amount);
          } else if (category === "Debt") {
            const debtType = type.toUpperCase().replace(" ", "_") as DebtType;
            debts.push({
              type: debtType,
              lenderName: name,
              outstandingBalance: parseFloat(amount),
              monthlyInstallment: parseFloat(monthly) || undefined,
            });
          }
        }

        resolve({ debts, income });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function printReport() {
  window.print();
}
