import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import { ToastProvider } from "@/lib/contexts/ToastContext";
import AIChatbot from "@/components/features/ai/AIChatbot";
import DocumentationButton from "@/components/features/DocumentationButton";
import PageTitleUpdater from "@/components/features/PageTitleUpdater";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TCAP - Thai Credit Ability Planner",
  description: "Calculate your Debt Service Ratio and simulate loans",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.className} bg-bg-primary min-h-screen text-text-primary font-display overflow-x-hidden relative selection:bg-primary selection:text-white`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              {children}
              <PageTitleUpdater />
              <DocumentationButton />
              <AIChatbot />
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
