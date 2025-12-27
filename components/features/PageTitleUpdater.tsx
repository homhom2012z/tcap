"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/lib/contexts/LanguageContext";

export default function PageTitleUpdater() {
  const pathname = usePathname();
  const tDashboard = useTranslations("dashboard");
  const tIncome = useTranslations("income");
  const tLiabilities = useTranslations("liabilities");
  const tSimulator = useTranslations("simulator");

  useEffect(() => {
    let title = "TCAP";

    if (pathname === "/") {
      title = `${tDashboard("title")} - TCAP`;
    } else if (pathname.includes("/income-details")) {
      title = `${tIncome("title")} - TCAP`;
    } else if (pathname.includes("/liabilities")) {
      title = `${tLiabilities("title")} - TCAP`;
    } else if (pathname.includes("/simulator")) {
      title = `${tSimulator("title")} - TCAP`;
    }

    document.title = title;
  }, [pathname, tDashboard]); // Re-run when path or language changes

  return null;
}
