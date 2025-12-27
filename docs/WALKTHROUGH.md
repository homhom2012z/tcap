# TCAP MVP Walkthrough

This guide explains how to use the Thai Credit Ability Planner (TCAP) MVP.

## 1. Getting Started

The application runs locally in your browser.

1. Run `npm run dev` in the terminal.
2. Open the localhost URL (usually `http://localhost:5173`).

## 2. Dashboard Overview

- **DSR Gauge**: Shows your current Debt Service Ratio.
  - **Green**: <40% (Healthy)
  - **Yellow**: 40-60% (Warning)
  - **Red**: >60% (Critical)
- **Stats**:
  - **Income**: Fixed at 50,000 THB for this demo (editable in code via `DEFAULT_SNAPSHOT`).
  - **Monthly Debts**: Sum of all your added obligations.
  - **Free Cash Flow**: Income minus Debts.

## 3. Adding a Debt

1.  Click the big **+** button (bottom right).
2.  Enter:
    - **Lender**: e.g., "KBank"
    - **Type**: e.g., "Credit Card"
    - **Balance**: e.g., "15000"
3.  Notice the "Bank Calculated Burden" updates automatically (e.g., 8% for cards).
4.  Click **Save Debt**.
5.  The Dashboard updates instantly.

## 4. Loan Simulator

1.  Click the **"Try Simulator"** button (bottom left).
2.  Adjust sliders for:
    - Loan Amount (10k - 2M)
    - Tenure (1 - 30 years)
3.  View the **"Impact Analysis"**:
    - See how your DSR would change if you took this loan.
    - See the projected Monthly Payment.

## 5. Privacy Note

All data is stored in **IndexedDB** on your browser. Clearing your browser cache will reset the data. No data is sent to any server.
