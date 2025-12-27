# AI Implementation Rules & Best Practices (TCAP)

This document defines the strict rules, anti-patterns, and coding standards for AI agents working on the **Thai Credit Ability Planner (TCAP)** project.

---

## 1. Core Philosophy: "Zero-Knowledge"

- **Rule**: The application must run 100% on the client-side.
- **Anti-Pattern**: Do NOT suggest or implement any feature that sends `UserSnapshot` or `Debt` data to a remote server, API, or telemetry service.
- **Best Practice**: Use `IndexedDB` (via `idb` library) for all data persistence.

## 2. Technology Stack Constraints

- **Styling**: Use **Tailwind CSS v4**.
  - _Note_: Do not add `@tailwind` directives for v3. Use v4's simple import structure if needed, or rely on the configured PostCSS plugin.
  - _Rule_: Prefer `class` utility names over inline styles.
  - _Rule_: Use the "Glassmorphism" aesthetic defined in `design/stitch.prompt.md` (white/10 opacity, backdrop-blur).
- **State Management**: Use **React Context** + **Hooks**.
  - _Anti-Pattern_: Do not introduce Redux, MobX, or Recoil. The app state (User Snapshot) is simple enough for Context.

## 3. Financial Logic Quality

- **Rule**: All money logic must use standard integer math (avoid floating point errors where possible, though JS numbers are usually safe for simple addition, use strict rounding).
- **Rule**: **NEVER hardcode DSR limits** (e.g., 40%) inside UI components. Import them from `src/utils/constants.ts` (to be created) or derive them from `docs/BANKING_RULES.md`.
- **Rule**: Always cite the "Bank of Thailand" logic when explaining calculations to the user via UI tips.

## 4. Coding Standards

- **Types**: Strict TypeScript. No `any`.
- **Components**:
  - Functional Components only.
  - Props must be typed via `interface`.
  - Separate "View" (UI) from "Logic" (Hooks).
- **Directory Structure**:
  - `src/components/ui`: Generic atomic components (Button, Card, Input).
  - `src/components/features`: Business-logic rich components (DebtList, DSRGauge).
  - `src/hooks`: Data access logic (`useDebts`, `useDSR`).

## 5. Security & Privacy

- **Anti-Pattern**: Collecting PII (Personally Identifiable Information) like Real Names, National IDs, or Phone Numbers. TCAP only needs "Nicknames" or generic identifiers.
- **Rule**: If a user uploads a PDF (future feature), it must be parsed in-browser (WASM/JS). Never upload the PDF.

## 6. Specific Anti-Patterns

- ❌ **"Mock API"**: Don't create fake `fetch()` calls. Just read/write to IndexedDB directly.
- ❌ **Over-Engineering**: Don't build a generic "Form Builder". Build the specific "Debt Form" we need.
- ❌ **Lorem Ipsum**: Use realistic financial data (e.g., "KBank Credit Card", "15,000 THB") for placeholders, not Latin text.

---

_Verified by: Project Lead_
_Last Updated: v1.0 MVP_
