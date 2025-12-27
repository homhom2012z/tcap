# Thai Credit Ability Planner (TCAP)

**A Privacy-First, Client-Side Financial Health & Debt Management Tool.**

TCAP is a specialized web application designed to help Thai users manage their debts, calculate their Debt Service Ratio (DSR), and plan their financial future—all without their private data ever leaving their device.

## 🔒 Privacy First: "Zero-Knowledge"

We believe financial data is personal. TCAP is built on a **Zero-Knowledge** architecture:

- **100% Client-Side**: All logic runs in your browser.
- **Local Storage**: Data is persisted using `IndexedDB` on your device only.
- **No Servers**: We do not have a backend database. We cannot see, store, or sell your data.
- **Offline Capable**: Works without an internet connection after initial load.

## ✨ Key Features

- **Dynamic DSR Calculator**: Automatically calculates your Debt Service Ratio based on Bank of Thailand guidelines, with dynamic health thresholds adjusted for your income level.
- **Thai Tax Shield**: Estimates potential tax savings from Home Loan interest deductions (up to 100,000 THB).
- **Refinance Calculator**: Compare "Refinance vs Retention" options with built-in logic for Thai mortgage fees and break-even analysis.
- **Debt Tracking**: Manage multiple debt types (Credit Cards, Personal Loans, Car, Home) with specific logic for each (e.g., 8% min payment for credit cards).
- **Smart Suggestions**: AI-powered (simulated locally) advice on payoff strategies (Avalanche vs. Snowball).
- **Amortization Simulator**: Visualize how extra payments can shorten your debt term.
- **Data Import/Export**:
  - Import from CSV.
  - Backup and restore your full data via JSON.
  - Parse PDF statements directly in the browser (WASM).

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (via `idb`)
- **Charts**: [Recharts](https://recharts.org/)
- **PDF Parsing**: `pdfjs-dist`

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/tcap.git
    cd tcap
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Run the development server:

    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

- [`AI_RULES.md`](docs/AI_RULES.md): Coding standards and anti-patterns for AI assistants.
- [`BANKING_RULES.md`](docs/BANKING_RULES.md): The financial formulas and Bank of Thailand regulations used.
- [`ARCHITECTURE.md`](docs/ARCHITECTURE.md): Technical overview of the data flow and local-first architecture.

## 📄 License

This project is licensed under the ISC License.
