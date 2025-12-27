import { useEffect, useCallback } from "react";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  handler: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches =
          event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.shiftKey
          ? event.shiftKey
          : !event.shiftKey;

        if (keyMatches && ctrlMatches && shiftMatches) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export const COMMON_SHORTCUTS = {
  NEW_DEBT: { key: "n", description: "Add new debt" },
  SIMULATOR: { key: "s", description: "Open simulator" },
  EXPORT: { key: "e", description: "Export data" },
  HELP: { key: "?", shiftKey: true, description: "Show help" },
  ESCAPE: { key: "Escape", description: "Close modal" },
};
