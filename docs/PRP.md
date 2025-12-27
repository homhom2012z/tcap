# Project: Thai Credit Ability Planner (Free)

## Version
v1.0 (MVP)

## Status
Concept → Buildable

---

## 1. Problem Statement

In Thailand, individuals applying for **car loans, home loans, or personal loans** often fail approval due to **high Debt Service Ratio (DSR)** rather than poor payment history.

However:

- Users do not clearly understand their **true monthly debt burden**
- Revolving debts (credit cards, personal loans) are often underestimated
- Credit Bureau (NCB) data is not readable or actionable for non-financial users
- Existing tools are either **bank-biased, paid, or opaque**

---

## 2. Goal & Vision

### Goal
Provide a **free, transparent, and educational web app** that allows users to:

- Build a complete debt list
- Understand their monthly debt obligations
- Calculate DSR
- Simulate new loans before applying at a bank

### Vision
Become a **neutral financial planning tool**, not a lender, broker, or credit scoring authority.

---

## 3. Non-Goals (Explicit Exclusions)

This product will **NOT**:

- Pull data directly from NCB
- Provide official credit scores
- Guarantee loan approvals
- Act as a lender or broker
- Store sensitive data without user consent

---

## 4. Target Users

### Primary
- Thai salaried employees
- First-time car / home buyers
- Individuals with multiple debts

### Secondary
- Freelancers (manual income input)
- Financial educators

---

## 5. Key Concepts (Thailand Context)

### Debt Service Ratio (DSR)

```
DSR = Total Monthly Debt Obligations / Gross Monthly Income
```

### Monthly Obligation Rules (Educational Standard)

| Debt Type | Monthly Obligation Rule |
|---------|-------------------------|
| Home loan | Actual installment |
| Car loan | Actual installment |
| Credit card | 10% × outstanding |
| Personal loan (revolving) | 5% × outstanding |

> These are publicly known banking assumptions, used for planning only.

---

## 6. Core Features (MVP)

### 6.1 Debt List Builder

Users can:
- Add debts manually
- Edit or remove debts
- Categorize debts by type

**Fields:**
- Lender name
- Debt type
- Outstanding balance
- Monthly installment (if applicable)
- Credit limit (optional)

---

### 6.2 Optional Credit Bureau Report Import

- User uploads their own **NCB PDF**
- System extracts debt items
- User must confirm all extracted data before use
- No automated NCB access

---

### 6.3 Monthly Obligation Engine

- Normalizes all debts into monthly values
- Uses predefined Thailand-specific rules

---

### 6.4 DSR Calculator

Displays:
- Current DSR
- Breakdown of monthly obligations
- Revolving vs installment ratio

---

### 6.5 Loan Simulator

Supports:
- Car loan
- Home loan

**Inputs:**
- Loan amount
- Interest rate
- Tenor
- Down payment

**Outputs:**
- Monthly installment
- New projected DSR

---

### 6.6 Visualization

- Debt distribution chart
- Monthly obligation summary
- DSR status indicator (Low / Medium / High)

---

## 7. User Flow

1. Open web app (no login required)
2. Enter gross monthly income
3. Add debts manually or upload NCB report
4. Review and confirm debt list
5. View DSR and debt summary
6. Simulate a new loan
7. Export summary (optional)

---

## 8. Data Handling & Privacy

### Storage Modes

#### Default: Local-Only
- Data stored in browser (IndexedDB)
- No server persistence
- No personal data transmission

#### Optional: Cloud Sync
- Explicit opt-in
- Encrypted payload
- User-initiated only

---

## 9. Legal & Compliance Considerations

### Disclaimers (Required)
- “For educational and planning purposes only”
- “Not a lender or credit bureau”
- “Does not guarantee loan approval”

### PDPA
- Explicit consent for any uploaded documents
- No resale or sharing of data
- Clear delete/reset option

---

## 10. Technical Architecture

### Frontend
- SPA (Angular or Next.js)
- Charting (Chart.js / ECharts)
- IndexedDB for local storage

### Backend (Optional)
- Node.js (Express / NestJS)
- PDF parsing service
- Stateless calculation engine

---

## 11. Data Model (Conceptual)

### Debt
```
id
type (card | personal | auto | home)
lender
outstanding
monthly_installment
credit_limit
```

### User Snapshot
```
gross_monthly_income
total_monthly_obligation
dsr
created_at
```

---

## 12. Success Metrics (MVP)

- User can calculate DSR in < 3 minutes
- Zero paid dependencies
- Works fully without login
- No legal complaints or data incidents

---

## 13. Future Enhancements (Optional)

- Multi-snapshot comparison
- Income averaging
- Educational debt reduction tips
- Export to PDF/CSV

---

## 14. Open Questions

- Should cloud sync be enabled in v1?
- Should PDF parsing be client-side only?
- Should loan assumptions be configurable by user?

---

## 15. Summary

This project provides a **free, ethical, and technically feasible** way for Thai users to understand their **credit ability and loan affordability**, without pretending to be a bank or credit bureau.
