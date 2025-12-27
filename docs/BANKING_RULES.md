# Thai Banking Rules & Calculation Logic

> This document serves as the **Single Source of Truth** for the financial formulas used in TCAP. All code in `src/utils/` must strictly implement these rules.

## 1. Debt Service Ratio (DSR)

**Formula:**
```
DSR (%) = (Total Monthly Obligations / Gross Monthly Income) * 100
```
- **Gross Monthly Income**: Before tax and deductions.
- **Total Monthly Obligations**: The sum of all "Calculated Monthly Payments".

---

## 2. Monthly Obligation Rules
Different debt types have different rules for calculating the "Monthly Burden" used by banks.

| Debt Type | Rule Key | Calculation Method | Notes |
| :--- | :--- | :--- | :--- |
| **Home Loan** | `ACTUAL` | Use User Input | Real banking installment is fixed. |
| **Car Loan** | `ACTUAL` | Use User Input | Fixed monthly payment. |
| **Credit Card** | `REVOLVING_8` | `Outstanding Balance * 8%` | BOT Regulation (2024-2025) [Reference 1]. |
| **Cash Card / Personal Loan** | `REVOLVING_5` | `Outstanding Balance * 5%` | Often lower min payment than cards. |
| **Other** | `ACTUAL` | Use User Input | Fallback. |

> **Note**: If `Outstanding Balance` is 0, the monthly obligation is 0, regardless of the credit limit.

## 5. References & Authenticity
To ensure reliability, we follow guidelines from the **Bank of Thailand (BOT)**:
1.  **Credit Card Minimum Payment**: Maintained at **8%** for 2024-2025 to assist debtors ([Source: BOT Press Release](https://www.bot.or.th/en/news-and-media/news/news-20231123.html)).
    *   *Note: Our engine defaults to 10% (the long-term standard) but allows for 8% toggling for accuracy.*
2.  **Responsible Lending Guidelines (DSR)**: The BOT encourages a DSR cap for vulnerable groups at 70%, though banks often use 40% as a healthy threshold for new loans.

---

## 3. DSR Health Indicators (Benchmarks)
These are general guidelines, not hard rules.

| DSR Range | Status | Meaning |
| :--- | :--- | :--- |
| **< 40%** | 🟢 Healthy | High chance of loan approval. |
| **40% - 60%** | 🟡 Medium | Approval likely, but loan amount may be capped. |
| **> 60%** | 🔴 High Risk | Very difficult to get new loans approved. |

---

## 4. Loan Simulator Logic

### Home Loan Simulation
Simplified formula for estimation:
```
Monthly Payment = (Loan Amount * Interest Rate / 12) / (1 - (1 + Interest Rate / 12)^(-TermMonths))
```
*Note: This is the standard PMT formula.*

### Car Loan Simulation (Thai Flat Rate)
Thai car loans use "Flat Rate" interest, which is different from effective rate.

1.  **Total Interest** = `Loan Amount * (Flat Rate %)` * `Years`
2.  **Total Principal + Interest** = `Loan Amount + Total Interest`
3.  **Monthly Payment** = `Total Principal + Interest` / `Months`
