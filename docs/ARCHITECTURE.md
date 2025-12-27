# TCAP Technical Architecture

## Core Principle: Zero-Knowledge / Local-Only
TCAP is designed to handle sensitive financial data without legally "processing" it on a server. This minimizes PDPA compliance risks and maximizes user trust.

### Data Flow
1.  User inputs data (Income, Debts) into the UI.
2.  Application Logic (in-browser) calculates DSR and obligations.
3.  Data is persisted to **IndexedDB** within the user's browser.
4.  (Future) User exports JSON file for backup.

**Legacy Server Interaction:** *None*. The app is a static SPA served via CDN/Localhost.

## Data Model (Local DB)

### `UserSnapshot`
The top-level object representing a user's financial state at a point in time.

```typescript
interface UserSnapshot {
  id: string;             // UUID
  grossMonthlyIncome: number;
  createdAt: number;      // Timestamp
  debts: Debt[];          // Array of Debt items
}
```

### `Debt`
Individual debt items.

```typescript
type DebtType = 'CREDIT_CARD' | 'PERSONAL_LOAN' | 'CAR_LOAN' | 'HOME_LOAN' | 'OTHER';

interface Debt {
  id: string;
  lenderName: string;     // e.g., "KBank", "SCB"
  type: DebtType;
  outstandingBalance: number;
  creditLimit?: number;   // Optional, useful for utilization ratio
  monthlyInstallment?: number; // User-inputted or Calculated
}
```

## Calculation Engine
The engine (located in `src/utils/calculator.ts`) is pure and stateless.
Input: `UserSnapshot` -> Output: `DSR Result`

> See [BANKING_RULES.md](./BANKING_RULES.md) for the specific formulas used.
