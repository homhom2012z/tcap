"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUserSnapshot } from "@/lib/hooks/useUserSnapshot";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useTranslations } from "@/lib/contexts/LanguageContext";

export default function NavBar() {
  const pathname = usePathname();
  const { snapshot } = useUserSnapshot();
  const router = useRouter();
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "d",
      ctrlKey: true,
      handler: () => router.push("/"),
      description: "Go to Dashboard",
    },
    {
      key: "s",
      ctrlKey: true,
      handler: () => router.push("/simulator"),
      description: "Go to Simulator",
    },
    {
      key: "l",
      ctrlKey: true,
      handler: () => router.push("/liabilities"),
      description: "Go to Liabilities",
    },
    {
      key: "i",
      ctrlKey: true,
      handler: () => router.push("/income-details"),
      description: "Go to Income Details",
    },
  ]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrolled = currentScrollY > 20;
      setIsScrolled(scrolled);

      // Show/Hide logic
      if (currentScrollY > lastScrollY && scrolled) {
        setIsVisible(false); // Hide on scroll down
      } else {
        setIsVisible(true); // Show on scroll up or at top
      }

      setLastScrollY(currentScrollY);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navItems = [
    { href: "/", label: t("dashboard"), icon: "dashboard" },
    { href: "/income-details", label: t("income"), icon: "payments" },
    { href: "/liabilities", label: t("liabilities"), icon: "account_balance" },
    { href: "/simulator", label: t("simulator"), icon: "calculate" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <div
        className="h-36 md:h-20 w-full relative z-40 bg-transparent"
        aria-hidden="true"
      />
      <header
        className={`fixed transition-all duration-500 ease-in-out z-50 glass-panel left-1/2 -translate-x-1/2
        ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-[150%] opacity-0"
        }
        ${
          isScrolled
            ? "top-4 w-[90%] max-w-5xl rounded-2xl shadow-2xl border border-white/10"
            : "top-0 w-full max-w-none rounded-none border-b border-border-secondary"
        }`}
      >
        <div
          className={`px-4 sm:px-6 lg:px-8 transition-all ${
            isScrolled ? "max-w-full" : "max-w-7xl mx-auto"
          }`}
        >
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary shadow-glow group-hover:bg-primary group-hover:text-text-inverse transition-colors">
                <span className="material-symbols-outlined text-[24px]">
                  account_balance_wallet
                </span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold tracking-tight text-text-primary drop-shadow-[0_0_10px_rgba(16,183,127,0.5)]">
                  TCAP
                </h1>
                <p className="text-[10px] text-text-secondary font-medium">
                  {t("subtitle")}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Income Display (Desktop only) */}
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-text-secondary">
                  {t("monthlyIncome")}
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  ฿{snapshot.grossMonthlyIncome.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-border-secondary px-4 py-2">
          <div className="flex items-center justify-around gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1 ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}
