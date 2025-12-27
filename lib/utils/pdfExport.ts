import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { UserSnapshot } from "./types";
import { calculateDSR } from "./calculator";
import { format } from "date-fns";

export function exportToPDF(snapshot: UserSnapshot) {
  const { debts, grossMonthlyIncome, additionalIncomes } = snapshot;
  const { dsrPercent, totalMonthlyObligation, totalDebt } =
    calculateDSR(snapshot);

  // Create PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(16, 183, 127);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(17, 24, 22);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("TCAP Financial Report", 20, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${format(new Date(), "PPP")}`, 20, 33);

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Summary Section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Summary", 20, 55);

  const summaryData = [
    ["Metric", "Value", "Status"],
    ["Monthly Income", `฿${grossMonthlyIncome.toLocaleString()}`, "-"],
    ["Total Debt", `฿${totalDebt.toLocaleString()}`, "-"],
    [
      "Monthly Obligations",
      `฿${Math.round(totalMonthlyObligation).toLocaleString()}`,
      "-",
    ],
    ["DSR", `${dsrPercent.toFixed(2)}%`, dsrPercent <= 40 ? "Safe" : "High"],
  ];

  autoTable(doc, {
    startY: 60,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    theme: "grid",
    headStyles: { fillColor: [16, 183, 127], textColor: [17, 24, 22] },
  });

  // Debts Table
  const finalY = (doc as any).lastAutoTable.finalY || 110;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Debt Breakdown", 20, finalY + 15);

  const debtData = [
    ["Lender", "Type", "Balance", "Monthly"],
    ...debts.map((debt) => [
      debt.lenderName,
      debt.type.replace("_", " "),
      `฿${debt.outstandingBalance.toLocaleString()}`,
      `฿${(debt.monthlyInstallment || 0).toLocaleString()}`,
    ]),
  ];

  autoTable(doc, {
    startY: finalY + 20,
    head: [debtData[0]],
    body: debtData.slice(1),
    theme: "striped",
    headStyles: { fillColor: [16, 183, 127], textColor: [17, 24, 22] },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Save
  doc.save(`tcap-financial-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}
