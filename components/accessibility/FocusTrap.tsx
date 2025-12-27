"use client";

import { useEffect, useRef, ReactNode } from "react";

interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;
  onEscape?: () => void;
}

export default function FocusTrap({
  children,
  active = true,
  onEscape,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const getFocusableElements = () => {
      return container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    };

    // Store the previously focused element
    const previouslyFocused = document.activeElement as HTMLElement;

    // Focus the first element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle tab key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      // Return focus to previously focused element
      if (previouslyFocused) {
        previouslyFocused.focus();
      }
    };
  }, [active, onEscape]);

  return (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
