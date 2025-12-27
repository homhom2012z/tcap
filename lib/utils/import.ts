import type { DebtType, UserSnapshot, Debt } from "./types";

interface ImportValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  debts?: Debt[];
}

interface BackupData {
  version: string;
  exportDate: string;
  snapshot: UserSnapshot;
}

/**
 * Parse CSV file and extract debt data
 */
export async function parseCSVDebts(file: File): Promise<ImportValidation> {
  const text = await file.text();
  const lines = text.split("\n").filter((line) => line.trim());

  if (lines.length === 0) {
    return {
      valid: false,
      errors: ["CSV file is empty"],
      warnings: [],
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const debts: Debt[] = [];

  // Parse header
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const requiredFields = ["lender", "type", "balance", "payment"];

  const missingFields = requiredFields.filter(
    (field) => !headers.some((h) => h.includes(field))
  );

  if (missingFields.length > 0) {
    errors.push(`Missing required columns: ${missingFields.join(", ")}`);
    return { valid: false, errors, warnings };
  }

  // Find column indices
  const lenderIdx = headers.findIndex((h) => h.includes("lender"));
  const typeIdx = headers.findIndex((h) => h.includes("type"));
  const balanceIdx = headers.findIndex((h) => h.includes("balance"));
  const paymentIdx = headers.findIndex((h) => h.includes("payment"));

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(",").map((v) => v.trim());
    const rowNum = i + 1;

    try {
      const lenderName = values[lenderIdx];
      const typeStr = values[typeIdx]?.toUpperCase().replace(/\s+/g, "_");
      const balance = parseFloat(
        values[balanceIdx]?.replace(/[,฿]/g, "") || "0"
      );
      const payment = parseFloat(
        values[paymentIdx]?.replace(/[,฿]/g, "") || "0"
      );

      // Validation
      if (!lenderName) {
        errors.push(`Row ${rowNum}: Lender name is required`);
        continue;
      }

      const validTypes: DebtType[] = [
        "CREDIT_CARD",
        "PERSONAL_LOAN",
        "CAR_LOAN",
        "HOME_LOAN",
        "OTHER",
      ];
      const type = validTypes.includes(typeStr as DebtType)
        ? (typeStr as DebtType)
        : "OTHER";

      if (typeStr && !validTypes.includes(typeStr as DebtType)) {
        warnings.push(
          `Row ${rowNum}: Unknown debt type "${values[typeIdx]}", defaulting to OTHER`
        );
      }

      if (isNaN(balance) || balance <= 0) {
        errors.push(`Row ${rowNum}: Invalid balance amount`);
        continue;
      }

      if (isNaN(payment) || payment < 0) {
        errors.push(`Row ${rowNum}: Invalid payment amount`);
        continue;
      }

      debts.push({
        id: `imported_${Date.now()}_${i}`,
        lenderName,
        type,
        outstandingBalance: balance,
        monthlyInstallment: payment || balance / 12, // Default to 12 months if no payment specified
      });
    } catch (error) {
      errors.push(`Row ${rowNum}: Failed to parse - ${error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    debts: debts.length > 0 ? debts : undefined,
  };
}

/**
 * Export full backup as JSON
 */
export function exportBackup(snapshot: UserSnapshot): string {
  const backup: BackupData = {
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    snapshot,
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * Import and validate backup JSON
 */
export function importBackup(jsonString: string): ImportValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed.snapshot) {
      errors.push("Invalid backup file: missing snapshot data");
      return { valid: false, errors, warnings };
    }

    const snapshot = parsed.snapshot;

    // Validate snapshot structure
    if (typeof snapshot.grossMonthlyIncome !== "number") {
      errors.push("Invalid income data");
    }

    if (!Array.isArray(snapshot.debts)) {
      errors.push("Invalid debts data");
    } else {
      // Validate each debt
      snapshot.debts.forEach((debt: any, idx: number) => {
        if (!debt.lenderName) {
          errors.push(`Debt ${idx + 1}: Missing lender name`);
        }
        if (
          typeof debt.outstandingBalance !== "number" ||
          debt.outstandingBalance <= 0
        ) {
          errors.push(`Debt ${idx + 1}: Invalid balance`);
        }
        if (
          typeof debt.monthlyInstallment !== "number" ||
          debt.monthlyInstallment < 0
        ) {
          errors.push(`Debt ${idx + 1}: Invalid monthly payment`);
        }
      });
    }

    if (errors.length > 0) {
      return { valid: false, errors, warnings };
    }

    return {
      valid: true,
      errors: [],
      warnings: [],
      debts: snapshot.debts,
    };
  } catch (error) {
    errors.push(`Failed to parse backup file: ${error}`);
    return { valid: false, errors, warnings };
  }
}

/**
 * Download file helper
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
