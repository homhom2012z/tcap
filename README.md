# Thai Credit Ability Planner (TCAP)

**A Privacy-First, Client-Side Financial Health & Debt Management Tool.**

TCAP is a specialized web application designed to help Thai users manage their debts, calculate their Debt Service Ratio (DSR), and plan their financial future—all without their private data ever leaving their device.

## Privacy Notice

We believe financial data is personal and sensitive. TCAP is built on a **Zero-Knowledge** architecture to ensure your absolute privacy:

- **100% Client-Side**: All calculations and logic run directly in your browser. No data is sent to any external server.
- **Local Storage Only**: Your financial data is stored securely on your own device using `IndexedDB`.
- **No Backend Database**: We do not maintain any database of user information. We cannot see, store, or sell your data.
- **Offline Capability**: The application functions fully without an internet connection after the initial load.
- **Transparent Codebase**: The source code is available for audit to verify these privacy claims.

## Key Features

### Financial Health Analysis

- **Dynamic DSR Calculator**: Automatically calculates your Debt Service Ratio based on Bank of Thailand guidelines. The health thresholds dynamically adjust based on your income level (e.g., stricter limits for lower income brackets).
- **Thai Tax Shield**: Estimates potential personal income tax savings derived from Home Loan interest deductions (capped at 100,000 THB per year).

### Debt Management

- **Comprehensive Debt Tracking**: Manage multiple debt types (Credit Cards, Personal Loans, Car Loans, Home Loans) with specific calculation logic for each.
- **Refinance Calculator**: Compare "Refinance" vs "Retention" options for home loans, factoring in Thai mortgage fees, stamp duties, and valuation costs to provide a clear break-even analysis.
- **Payoff Strategies**: AI-powered local simulation suggests optimal payoff strategies (Avalanche vs. Snowball) customized to your debt profile.
- **Amortization Simulator**: Visualize how extra monthly payments can shorten your loan term and reduce total interest.

### Data Management

- **Secure Import/Export**: Backup your data to a JSON file or import from CSV.
- **PDF Parsing**: Parse detailed debt information directly from NCB (National Credit Bureau) PDF statements using client-side WASM technology.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: IndexedDB (via `idb`)
- **Charts**: Recharts
- **PDF Parsing**: pdfjs-dist

## Getting Started

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

## Documentation

Detailed documentation is available in the `docs/` directory:

- [`AI_RULES.md`](docs/AI_RULES.md): Coding standards for AI assistants.
- [`BANKING_RULES.md`](docs/BANKING_RULES.md): Financial formulas and Bank of Thailand regulations.
- [`ARCHITECTURE.md`](docs/ARCHITECTURE.md): Technical overview of the local-first architecture.

## License

This project is licensed under the ISC License.
