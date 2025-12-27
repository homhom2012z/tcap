import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Income Details - TCAP",
  description: "Manage your income sources and gross salary details",
};

export default function IncomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
