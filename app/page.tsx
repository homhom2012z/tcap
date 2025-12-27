"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useUserSnapshot } from "@/lib/hooks/useUserSnapshot";
import {
  calculateDSR,
  calculateMonthlyObligation,
  calculateTaxSaving,
} from "@/lib/utils/calculator";
import AddDebtForm from "@/components/features/AddDebtForm";
import NavBar from "@/components/layout/NavBar";
import dynamic from "next/dynamic";
import { generateRecommendations } from "@/lib/utils/recommendations";
import RecommendationCard from "@/components/features/RecommendationCard";
import DashboardEmptyState from "@/components/features/DashboardEmptyState";
import PayoffCalculator from "@/components/features/PayoffCalculator";
import { useTranslations } from "@/lib/contexts/LanguageContext";
import LazyLoad from "@/components/utils/LazyLoad";

// Lazy Load Charts
const DebtBreakdownChart = dynamic(
  () => import("@/components/charts/DebtBreakdownChart"),
  {
    loading: () => (
      <div className="h-full w-full bg-surface-secondary/20 animate-pulse rounded-lg flex items-center justify-center text-text-muted text-sm">
        Loading Chart...
      </div>
    ),
    ssr: false,
  }
);
const CashFlowChart = dynamic(
  () => import("@/components/charts/CashFlowChart"),
  {
    loading: () => (
      <div className="h-full w-full bg-surface-secondary/20 animate-pulse rounded-lg" />
    ),
    ssr: false,
  }
);
const DSRTrendChart = dynamic(
  () => import("@/components/charts/DSRTrendChart"),
  {
    loading: () => (
      <div className="h-full w-full bg-surface-secondary/20 animate-pulse rounded-lg" />
    ),
    ssr: false,
  }
);
const PaymentTimeline = dynamic(
  () => import("@/components/charts/PaymentTimeline"),
  {
    loading: () => (
      <div className="h-full w-full bg-surface-secondary/20 animate-pulse rounded-lg" />
    ),
    ssr: false,
  }
);
const DebtProjectionChart = dynamic(
  () => import("@/components/charts/DebtProjectionChart"),
  {
    loading: () => (
      <div className="h-full w-full bg-surface-secondary/20 animate-pulse rounded-lg" />
    ),
    ssr: false,
  }
);

export default function Home() {
  const { snapshot, loading, addDebt } = useUserSnapshot();
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const tLiabilities = useTranslations("liabilities");
  // const tSimulator = useTranslations("simulator"); // Not strictly needed if we use dashboard specifics or if we added keys to dashboard.
  // Actually I added "fullSimulator" etc to dashboard. "Loan Simulator" title is in simulator namespace.
  const tSimulator = useTranslations("simulator");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dismissedRecs, setDismissedRecs] = useState<string[]>([]);
  const [isAiMode, setIsAiMode] = useState(false);

  const { totalMonthlyObligation, dsrPercent, isHealthy, totalDebt } =
    calculateDSR(snapshot);

  const grossMonthlyIncome = snapshot.grossMonthlyIncome;
  const debts = snapshot.debts;

  // Generate recommendations
  const recommendations = useMemo(() => {
    return generateRecommendations(snapshot).filter(
      (rec) => !dismissedRecs.includes(rec.id)
    );
  }, [snapshot, dismissedRecs]);

  // Calculate estimated tax saving from Home Loans
  const estimatedTaxSaving = useMemo(() => {
    const homeLoans = snapshot.debts.filter((d) => d.type === "HOME_LOAN");
    if (homeLoans.length === 0) return 0;

    const totalAnnualInterest = homeLoans.reduce((sum, loan) => {
      // Estimate 1st year interest
      // If we don't have interest rate, assume generic 3%
      const rate = loan.interestRate || 3.0;
      // If we don't have term, assume 1 year for calc (rough estimate)
      // Actually we should try to be as accurate as possible.
      // Interest ~= Balance * Rate / 100 roughly for a year (slightly less due to principal paydown)
      // Let's use amortization for better accuracy if possible, otherwise simple interest
      return sum + loan.outstandingBalance * (rate / 100);
    }, 0);

    return calculateTaxSaving(
      totalAnnualInterest,
      snapshot.grossMonthlyIncome * 12
    );
  }, [snapshot.debts, snapshot.grossMonthlyIncome]);

  if (loading) {
    return (
      <div className="bg-bg-primary min-h-screen text-text-primary font-display overflow-x-hidden relative">
        {/* Background Gradients */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/5 light:bg-primary/10 rounded-full blur-[120px] mix-blend-screen"></div>
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/5 light:bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <NavBar />

          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
            {/* Recommendations Skeleton */}
            <section>
              <div className="h-6 bg-surface-secondary rounded w-48 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="size-12 bg-surface-secondary rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-surface-secondary rounded w-32 mb-2"></div>
                      <div className="h-3 bg-surface-tertiary rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-surface-tertiary rounded w-full mb-2"></div>
                  <div className="h-3 bg-surface-tertiary rounded w-5/6"></div>
                </div>
                <div className="glass-card rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="size-12 bg-surface-secondary rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-surface-secondary rounded w-32 mb-2"></div>
                      <div className="h-3 bg-surface-tertiary rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-surface-tertiary rounded w-full mb-2"></div>
                  <div className="h-3 bg-surface-tertiary rounded w-5/6"></div>
                </div>
              </div>
            </section>

            {/* Gauge Skeleton */}
            <section className="flex flex-col items-center justify-center py-8 animate-pulse">
              <div className="w-[300px] h-[150px] bg-surface-secondary rounded-full mb-4"></div>
              <div className="h-12 bg-surface-secondary rounded w-32 mb-2"></div>
              <div className="h-4 bg-surface-tertiary rounded w-48"></div>
            </section>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="glass-card rounded-2xl p-6 animate-pulse"
                >
                  <div className="h-4 bg-surface-secondary rounded w-24 mb-3"></div>
                  <div className="h-8 bg-surface-tertiary rounded w-32"></div>
                </div>
              ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-surface-secondary rounded w-40 mb-4"></div>
                <div className="h-[300px] bg-surface-tertiary rounded"></div>
              </div>
              <div className="glass-card rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-surface-secondary rounded w-40 mb-4"></div>
                <div className="h-[300px] bg-surface-tertiary rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const freeCashFlow = grossMonthlyIncome - totalMonthlyObligation;

  // Export chart data to CSV
  const exportChartData = (chartName: string) => {
    let csvContent = "";

    if (chartName === "dsr_trend") {
      csvContent = "Month,DSR\n";
      const now = new Date();
      for (let i = 0; i < 6; i++) {
        const month = new Date(now);
        month.setMonth(month.getMonth() + i);
        csvContent += `${month.toLocaleDateString("en-US", {
          month: "short",
        })},${Math.round(dsrPercent)}%\n`;
      }
    } else if (chartName === "debt_breakdown") {
      csvContent = "Debt,Amount\n";
      debts.forEach((debt) => {
        csvContent += `${debt.lenderName},${debt.outstandingBalance}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chartName}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <div
        className={`bg-bg-primary min-h-screen text-text-primary font-display overflow-x-hidden relative selection:bg-primary selection:text-white transition-all duration-300 ${
          isAddModalOpen ? "blur-sm scale-95 pointer-events-none" : ""
        }`}
      >
        {/* Background Gradients */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/5 light:bg-primary/10 rounded-full blur-[120px] mix-blend-screen"></div>
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/5 light:bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <NavBar />

          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex flex-col gap-6 md:gap-10">
            {/* Show empty state if no debts */}
            {debts.length === 0 ? (
              <DashboardEmptyState />
            ) : (
              <>
                {/* Recommendations Section */}
                {recommendations.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">
                        lightbulb
                      </span>
                      {t("recommendations")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.map((rec) => (
                        <RecommendationCard
                          key={rec.id}
                          recommendation={rec}
                          onDismiss={(id) =>
                            setDismissedRecs((prev) => [...prev, id])
                          }
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Gauge Section */}
                <section className="flex flex-col items-center justify-center py-8 animate-fade-in-up">
                  <div className="relative w-[300px] h-[150px] flex items-end justify-center">
                    <svg
                      className="w-full h-full overflow-visible"
                      viewBox="0 0 200 110"
                    >
                      <defs>
                        <linearGradient
                          id="gaugeGradient"
                          x1="0%"
                          x2="100%"
                          y1="0%"
                          y2="0%"
                        >
                          <stop
                            offset="0%"
                            style={{
                              stopColor: isHealthy ? "#10b77f" : "#f59e0b",
                              stopOpacity: 1,
                            }}
                          ></stop>
                          <stop
                            offset="100%"
                            style={{
                              stopColor: isHealthy ? "#34d399" : "#fbbf24",
                              stopOpacity: 1,
                            }}
                          ></stop>
                        </linearGradient>
                        <filter
                          height="200%"
                          id="glow"
                          width="200%"
                          x="-50%"
                          y="-50%"
                        >
                          <feGaussianBlur
                            in="SourceGraphic"
                            result="blur"
                            stdDeviation="2.5"
                          ></feGaussianBlur>
                          <feComponentTransfer in="blur" result="coloredBlur">
                            <feFuncA slope="0.8" type="linear"></feFuncA>
                          </feComponentTransfer>
                          <feMerge>
                            <feMergeNode in="coloredBlur"></feMergeNode>
                            <feMergeNode in="SourceGraphic"></feMergeNode>
                          </feMerge>
                        </filter>
                      </defs>
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="currentColor"
                        className="text-border-primary transition-colors"
                        strokeLinecap="round"
                        strokeWidth="12"
                      ></path>
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        strokeDasharray="251.2"
                        strokeDashoffset={
                          251.2 - (251.2 * Math.min(dsrPercent, 100)) / 100
                        }
                        fill="none"
                        filter="url(#glow)"
                        stroke="url(#gaugeGradient)"
                        strokeLinecap="round"
                        strokeWidth="12"
                        className="transition-all duration-1000 ease-out"
                      ></path>
                      <text
                        className="fill-text-primary text-[32px] font-bold tracking-tight drop-shadow-xl transition-colors duration-300"
                        textAnchor="middle"
                        x="100"
                        y="85"
                      >
                        {Math.round(dsrPercent)}%
                      </text>
                      <text
                        className="fill-text-secondary text-[10px] uppercase tracking-widest font-bold transition-colors duration-300"
                        textAnchor="middle"
                        x="100"
                        y="105"
                      >
                        {t("dsrScore")}
                      </text>
                    </svg>
                  </div>
                  <div className="w-[300px] flex justify-between px-6 mt-4 mb-6">
                    <span className="text-xs font-bold text-emerald-500 tracking-wider drop-shadow-sm">
                      {t("safe")}
                    </span>
                    <span className="text-xs font-bold text-red-400 tracking-wider drop-shadow-sm">
                      {t("risk")}
                    </span>
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
                      {isHealthy ? t("healthyTitle") : t("cautionTitle")}
                    </h2>
                    <p className="text-text-secondary text-sm md:text-base max-w-md mx-auto leading-relaxed">
                      {isHealthy
                        ? t("healthyDescription")
                        : t("cautionDescription")}
                    </p>
                  </div>
                </section>

                {/* Stats Cards */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Income Card */}
                  <div className="glass-card rounded-2xl p-6 flex flex-col justify-between h-40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <span className="material-symbols-outlined text-6xl text-emerald-400">
                        payments
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <span className="material-symbols-outlined">
                          account_balance
                        </span>
                      </div>
                      <span className="text-sm font-medium text-text-secondary">
                        {t("grossIncome")}
                      </span>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-text-primary tracking-tight">
                        {grossMonthlyIncome.toLocaleString()}{" "}
                        <span className="text-lg text-text-muted font-medium">
                          THB
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400">
                        <span className="material-symbols-outlined text-[14px]">
                          trending_up
                        </span>
                        <span>{t("verified")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Debt Card */}
                  <div className="glass-card rounded-2xl p-6 flex flex-col justify-between h-40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <span className="material-symbols-outlined text-6xl text-orange-400">
                        credit_card
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
                        <span className="material-symbols-outlined">
                          remove_circle_outline
                        </span>
                      </div>
                      <span className="text-sm font-medium text-text-secondary">
                        {t("monthlyDebts")}
                      </span>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-text-primary tracking-tight">
                        {totalMonthlyObligation.toLocaleString()}{" "}
                        <span className="text-lg text-text-muted font-medium">
                          THB
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-orange-400">
                        <span className="material-symbols-outlined text-[14px]">
                          warning
                        </span>
                        <span>
                          {t("incomePercentage", {
                            percent: Math.round(dsrPercent),
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Free Cash Flow Card */}
                  <div className="glass-card rounded-2xl p-6 flex flex-col justify-between h-40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <span className="material-symbols-outlined text-6xl text-blue-400">
                        savings
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <span className="material-symbols-outlined">
                          account_balance_wallet
                        </span>
                      </div>
                      <span className="text-sm font-medium text-text-secondary">
                        {t("freeCashFlow")}
                      </span>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-text-primary tracking-tight">
                        {freeCashFlow.toLocaleString()}{" "}
                        <span className="text-lg text-text-muted font-medium">
                          THB
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-blue-400">
                        <span className="material-symbols-outlined text-[14px]">
                          check_circle
                        </span>
                        <span>{t("availableForLoan")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tax Shield Card */}
                  <div className="glass-card rounded-2xl p-6 flex flex-col justify-between h-40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <span className="material-symbols-outlined text-6xl text-purple-400">
                        verified_user
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <span className="material-symbols-outlined">
                          shield
                        </span>
                      </div>
                      <span className="text-sm font-medium text-text-secondary">
                        {t("taxShield")}
                      </span>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-text-primary tracking-tight">
                        {estimatedTaxSaving.toLocaleString()}{" "}
                        <span className="text-lg text-text-muted font-medium">
                          THB
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-purple-400">
                        <span className="material-symbols-outlined text-[14px]">
                          info
                        </span>
                        <span title={t("taxSavingDesc")}>
                          {t("estTaxSaving")}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Charts Section */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Debt Breakdown */}
                  <div className="glass-card rounded-2xl p-6 animate-chart-entrance stagger-1">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-primary">
                        pie_chart
                      </span>
                      <h3 className="text-lg font-bold text-text-primary">
                        {t("debtBreakdown")}
                      </h3>
                    </div>
                    <LazyLoad className="h-[250px] md:h-[300px]">
                      <DebtBreakdownChart snapshot={snapshot} />
                    </LazyLoad>
                  </div>

                  {/* Cash Flow */}
                  <div className="glass-card rounded-2xl p-6 animate-chart-entrance stagger-2">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-blue-400">
                        bar_chart
                      </span>
                      <h3 className="text-lg font-bold text-text-primary">
                        {t("cashFlow")}
                      </h3>
                    </div>
                    <LazyLoad className="h-[250px] md:h-[300px]">
                      <CashFlowChart snapshot={snapshot} />
                    </LazyLoad>
                  </div>
                </section>

                {/* Advanced Analytics Section */}
                <section>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">
                        analytics
                      </span>
                      {t("advancedAnalytics")}
                    </h2>
                    <p className="text-text-secondary text-sm">
                      {t("analyticsDescription")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* DSR Trend Chart */}
                    <div className="glass-card rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">
                            trending_up
                          </span>
                          <h3 className="text-lg font-bold text-text-primary">
                            {t("dsrTrendAnalysis")}
                          </h3>
                        </div>
                        <button
                          onClick={() => exportChartData("dsr_trend")}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary border border-border-primary hover:border-primary rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            download
                          </span>
                          {t("export")}
                        </button>
                      </div>
                      <LazyLoad className="h-[250px] md:h-[300px]">
                        <DSRTrendChart snapshot={snapshot} />
                      </LazyLoad>
                    </div>

                    {/* Payment Timeline + Debt Projection */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Payment Timeline */}
                      <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="material-symbols-outlined text-amber-500">
                            calendar_month
                          </span>
                          <h3 className="text-lg font-bold text-text-primary">
                            {t("paymentSchedule")}
                          </h3>
                        </div>
                        <LazyLoad className="h-[300px] md:h-[350px]">
                          <PaymentTimeline debts={debts} />
                        </LazyLoad>
                      </div>

                      {/* Debt Projection */}
                      <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-400">
                              show_chart
                            </span>
                            <h3 className="text-lg font-bold text-text-primary">
                              {t("debtPaydownProjection")}
                            </h3>
                          </div>
                          <div className="flex items-center gap-4">
                            {/* AI Toggle */}
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-bold transition-colors ${
                                  isAiMode
                                    ? "text-primary drop-shadow-[0_0_8px_rgba(16,183,127,0.8)]"
                                    : "text-gray-500"
                                }`}
                              >
                                AI Optimization
                              </span>
                              <button
                                onClick={() => setIsAiMode(!isAiMode)}
                                aria-label={
                                  isAiMode
                                    ? "Disable AI Optimization"
                                    : "Enable AI Optimization"
                                }
                                className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${
                                  isAiMode ? "bg-primary" : "bg-gray-600"
                                }`}
                              >
                                <div
                                  className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform duration-300 ${
                                    isAiMode ? "translate-x-5" : ""
                                  }`}
                                ></div>
                              </button>
                            </div>

                            <button
                              onClick={() => exportChartData("debt_breakdown")}
                              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary border border-border-primary hover:border-primary rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                download
                              </span>
                              {t("export")}
                            </button>
                          </div>
                        </div>
                        <LazyLoad className="h-[250px] md:h-[300px]">
                          <DebtProjectionChart
                            snapshot={snapshot}
                            isAiMode={isAiMode}
                          />
                        </LazyLoad>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Payoff Calculator Section */}
                <section>
                  <PayoffCalculator debts={debts} />
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
                  {/* Mini Simulator Teaser */}
                  <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-text-primary">
                        {tSimulator("title")}
                      </h3>
                      <Link
                        href="/simulator"
                        className="text-sm text-primary hover:text-emerald-300 font-medium"
                      >
                        {t("fullSimulator")}
                      </Link>
                    </div>
                    <div className="bg-surface-secondary/50 rounded-xl p-6 border border-border-primary">
                      <p className="text-text-secondary mb-4">
                        {t("quickCheck")}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                          <div className="text-2xl font-bold text-text-primary mb-2">
                            250,000{" "}
                            <span className="text-sm text-text-muted">THB</span>
                          </div>
                          <div className="w-full h-2 bg-gray-700 rounded-lg overflow-hidden">
                            <div className="bg-primary h-full w-1/4"></div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <span className="text-sm text-text-secondary">
                              {t("estMonthlyPay")}
                            </span>
                            <span className="text-lg font-bold text-text-primary">
                              ~7,500 {tCommon("baht")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-text-secondary">
                              {t("result")}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold border ${
                                isHealthy
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : "bg-red-500/20 text-red-400 border-red-500/30"
                              }`}
                            >
                              {isHealthy ? t("likelyApproved") : t("riskHigh")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Debts */}
                  <div className="glass-card rounded-2xl p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-text-primary mb-4">
                      {tLiabilities("activeDebts")}
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                      {debts.length === 0 ? (
                        <div className="text-text-muted text-center py-8">
                          {t("noDebtsAdded")}
                        </div>
                      ) : (
                        debts.map((debt) => {
                          const isFixedTerm =
                            debt.installmentPeriod &&
                            debt.installmentPeriod > 0;
                          return (
                            <div
                              key={debt.id}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-surface-secondary flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[18px] text-text-secondary">
                                    credit_card
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                                    {debt.lenderName}
                                  </div>
                                  <div className="text-xs text-text-muted">
                                    {debt.outstandingBalance.toLocaleString()}{" "}
                                    {t("balance")}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-text-primary">
                                  {calculateMonthlyObligation(
                                    debt
                                  ).toLocaleString()}
                                </div>
                                <div className="text-[10px] text-text-muted">
                                  {isFixedTerm
                                    ? `${tCommon("baht")} ${tCommon(
                                        "perMonth"
                                      )}`
                                    : t("minPay")}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <Link
                      href="/liabilities"
                      className="w-full mt-4 block text-center text-xs font-medium text-text-secondary hover:text-text-primary py-2 border border-dashed border-border-primary rounded-lg hover:border-text-secondary transition-all"
                    >
                      {t("viewAllHistory")}
                    </Link>
                  </div>
                </section>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Modal */}
      {isAddModalOpen && (
        <AddDebtForm
          onClose={() => setIsAddModalOpen(false)}
          onSave={addDebt}
        />
      )}
    </>
  );
}
