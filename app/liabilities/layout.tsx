import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liabilities - TCAP",
  description: "Track your active debts and monthly obligations",
};

export default function LiabilitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
