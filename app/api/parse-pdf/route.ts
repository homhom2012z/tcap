import { NextRequest, NextResponse } from "next/server";
import { Debt } from "@/lib/utils/types";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to Buffer/Uint8Array for pdfjs-dist
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    // Load pdfjs-dist dynamically (legacy build for Node.js support)
    // @ts-ignore
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

    // Configure worker
    // in Next.js Server Components/Routes, we need to ensure the worker is located correctly.
    // For text extraction, we can technically disable the worker or try to point to it.
    // However, simplest fix for "Setting up fake worker failed" is often to just use the library on main thread or fix resolution.

    // Polyfill standard Promise if missing (rare in Node 18+)
    // Point to the worker file explicitly to help the resolver
    // @ts-ignore
    await import("pdfjs-dist/legacy/build/pdf.worker.mjs");

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data,
      // Disable worker (force main thread) if worker loading is flaky in Edge/Serverless
      disableFontFace: true,
    });
    const pdfDocument = await loadingTask.promise;

    // Extract text from all pages
    let fullText = "";
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    // --- Parsing Logic ---
    const debts: Partial<Debt>[] = [];

    // Split by "Account No" (Thai: บัญชีที่) to handle multiple accounts
    const accountSegments = fullText.split("บัญชีที่");

    // Skip the first segment (usually personal info header)
    for (let i = 1; i < accountSegments.length; i++) {
      const segment = accountSegments[i];

      // 1. Extract Account Type
      // Pattern: ประเภทสินเชื่อ [Whitespace] Value [Whitespace]
      const typeMatch = segment.match(/ประเภทสินเชื่อ\s+(.+?)\s/);
      const rawType = typeMatch ? typeMatch[1].trim() : "Unknown";

      // Map Thai types to our ENUMS
      let type: Debt["type"] = "PERSONAL_LOAN"; // Default
      if (rawType.includes("บัตรเครดิต") || rawType.includes("Credit Card"))
        type = "CREDIT_CARD";
      else if (
        rawType.includes("บ้าน") ||
        rawType.includes("ที่อยู่อาศัย") ||
        rawType.includes("Mortgage")
      )
        type = "HOME_LOAN";
      else if (
        rawType.includes("เช่าซื้อ") ||
        rawType.includes("รถ") ||
        rawType.includes("Auto")
      )
        type = "CAR_LOAN";

      // 2. Extract Outstanding Balance
      // Pattern: ยอดหนี้คงเหลือ [Whitespace] 123,456
      const balanceMatch = segment.match(/ยอดหนี้คงเหลือ\s+([\d,]+)/);
      const outstandingBalance = balanceMatch
        ? parseFloat(balanceMatch[1].replace(/,/g, ""))
        : 0;

      // 3. Extract Installment
      const installmentMatch = segment.match(
        /ยอดผ่อนชำระในแต่ละงวด.*?([\d,]+)/
      );
      let monthlyInstallment = installmentMatch
        ? parseFloat(installmentMatch[1].replace(/,/g, ""))
        : 0;

      // If installment is 0, estimate based on type
      if (monthlyInstallment === 0 && outstandingBalance > 0) {
        if (type === "CREDIT_CARD")
          monthlyInstallment = outstandingBalance * 0.1; // 10% assumption
        if (type === "PERSONAL_LOAN")
          monthlyInstallment = outstandingBalance * 0.03; // 3% assumption
      }

      // Generate lender name
      const lenderName = `${rawType} (Account ${i})`;

      // Only add if there is a balance (Active Debt)
      if (outstandingBalance > 0) {
        debts.push({
          lenderName,
          type,
          outstandingBalance,
          monthlyInstallment,
        });
      }
    }

    return NextResponse.json({ debts });
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}
