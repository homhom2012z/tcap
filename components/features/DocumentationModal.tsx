"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/contexts/LanguageContext";
import FocusTrap from "@/components/accessibility/FocusTrap";

interface DocumentationModalProps {
  onClose: () => void;
}

export default function DocumentationModal({
  onClose,
}: DocumentationModalProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "income" | "debts" | "simulator"
  >("overview");

  const t = useTranslations("docs");

  const tabs = [
    { id: "overview", label: t("tabs.overview"), icon: "dashboard" },
    { id: "income", label: t("tabs.income"), icon: "payments" },
    { id: "debts", label: t("tabs.debts"), icon: "credit_card" },
    { id: "simulator", label: t("tabs.simulator"), icon: "calculate" },
  ] as const;

  return (
    <FocusTrap active={true} onEscape={onClose}>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop - Adaptable for light mode if needed, but usually dark is fine. 
            Using black/60 is standard for modals, but let's make it smarter. */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
          onClick={onClose}
        />

        {/* Modal - Replaced hardcoded #111816 with bg-bg-secondary and semantic borders */}
        <div className="relative bg-bg-secondary backdrop-blur-xl border border-border-primary rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-fade-in-up">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-surface-secondary hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors backdrop-blur-sm"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {/* Sidebar / Tabs */}
          <div className="w-full md:w-64 bg-surface-secondary/30 border-b md:border-b-0 md:border-r border-border-primary flex-shrink-0">
            <div className="p-6 border-b border-border-primary">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  menu_book
                </span>
                <span>{t("title")}</span>
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                {t("subtitle")}
              </p>
            </div>
            <div className="p-2 space-y-1 overflow-x-auto md:overflow-visible flex md:block">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                    activeTab === tab.id
                      ? "bg-primary/20 text-primary font-bold border border-primary/20"
                      : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined">{tab.icon}</span>
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 mb-6">
                  <h3 className="text-2xl font-bold text-text-primary mb-2">
                    {t("overview.welcome")}
                  </h3>
                  <p className="text-text-secondary">
                    {t("overview.description")}
                    <br />
                    <span className="text-sm opacity-75">
                      {t("overview.descriptionTh")}
                    </span>
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500">
                      health_and_safety
                    </span>
                    {t("overview.healthTitle")}
                  </h4>
                  <p className="text-text-secondary leading-relaxed">
                    {t("overview.healthDesc")}
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-text-secondary ml-2">
                    <li>
                      <strong className="text-emerald-500">{"<"} 40%</strong>:{" "}
                      {t("overview.healthySafe")}
                    </li>
                    <li>
                      <strong className="text-yellow-500">40% - 60%</strong>:{" "}
                      {t("overview.healthyModerate")}
                    </li>
                    <li>
                      <strong className="text-red-500">{">"} 60%</strong>:{" "}
                      {t("overview.healthyRisk")}
                    </li>
                  </ul>

                  <div className="mt-6 pt-4 border-t border-border-secondary">
                    <p className="text-sm font-semibold text-text-primary mb-1">
                      {t("overview.referenceTitle")}
                    </p>
                    <a
                      href="https://www.bot.or.th/content/dam/bot/documents/th/statistics/dms/financial-institutions/%E0%B9%80%E0%B8%AD%E0%B8%81%E0%B8%AA%E0%B8%B2%E0%B8%A3%E0%B8%AA%E0%B8%A3%E0%B8%B8%E0%B8%9B%E0%B8%A1%E0%B8%B2%E0%B8%95%E0%B8%A3%E0%B8%90%E0%B8%B2%E0%B8%99%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%84%E0%B8%B3%E0%B8%99%E0%B8%A7%E0%B8%93%20Debt%20Service%20Ratio_%E0%B9%80%E0%B8%AD%E0%B8%81%E0%B8%AA%E0%B8%B2%E0%B8%A3%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%AD%E0%B8%9A.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:text-emerald-400 hover:underline flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        link
                      </span>
                      {t("overview.referenceLinkText")}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "income" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-text-primary mb-4">
                  {t("income.title")}
                </h3>

                <div className="grid gap-6">
                  <div className="p-4 rounded-xl border border-border-primary bg-surface-secondary">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
                        <span className="material-symbols-outlined">edit</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary mb-1">
                          {t("income.setMainTitle")}
                        </h4>
                        <p className="text-sm text-text-secondary">
                          {t("income.setMainDesc")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border-primary bg-surface-secondary">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500">
                        <span className="material-symbols-outlined">
                          add_circle
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary mb-1">
                          {t("income.additionalTitle")}
                        </h4>
                        <p className="text-sm text-text-secondary">
                          {t("income.additionalDesc")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "debts" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-text-primary mb-4">
                  {t("debts.title")}
                </h3>

                <p className="text-text-secondary mb-4">
                  {t("debts.description")}
                </p>

                <div className="space-y-4">
                  <div className="bg-surface-secondary p-4 rounded-xl border border-border-primary">
                    <h5 className="font-semibold text-text-primary mb-2">
                      {t("debts.typesTitle")}
                    </h5>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-text-muted">
                          credit_card
                        </span>
                        <span className="text-text-secondary">
                          {t("debts.creditCards")}
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-text-muted">
                          directions_car
                        </span>
                        <span className="text-text-secondary">
                          {t("debts.carLoans")}
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-text-muted">
                          home
                        </span>
                        <span className="text-text-secondary">
                          {t("debts.homeLoans")}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-surface-secondary p-4 rounded-xl border border-border-primary">
                    <h5 className="font-semibold text-text-primary mb-2">
                      {t("debts.importTitle")}
                    </h5>
                    <p className="text-sm text-text-secondary">
                      {t("debts.importDesc")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "simulator" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-text-primary mb-4">
                  {t("simulator.title")}
                </h3>

                <p className="text-text-secondary">
                  {t("simulator.description")}
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-xl bg-surface-secondary border border-border-primary">
                    <h4 className="font-semibold text-text-primary mb-2 text-sm uppercase tracking-wide">
                      {t("simulator.step1Title")}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {t("simulator.step1Desc")}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-secondary border border-border-primary">
                    <h4 className="font-semibold text-text-primary mb-2 text-sm uppercase tracking-wide">
                      {t("simulator.step2Title")}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {t("simulator.step2Desc")}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-secondary border border-border-primary">
                    <h4 className="font-semibold text-text-primary mb-2 text-sm uppercase tracking-wide">
                      {t("simulator.step3Title")}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {t("simulator.step3Desc")}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-secondary border border-border-primary">
                    <h4 className="font-semibold text-text-primary mb-2 text-sm uppercase tracking-wide">
                      {t("simulator.step4Title")}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {t("simulator.step4Desc")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
