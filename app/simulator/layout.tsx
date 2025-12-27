import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan Simulator - TCAP",
  description: "Simulate loans and compare repayment scenarios",
};

export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
