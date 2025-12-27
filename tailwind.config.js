/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Background colors
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
        },
        // Surface colors (for cards, panels)
        surface: {
          primary: "var(--surface-primary)",
          secondary: "var(--surface-secondary)",
          hover: "var(--surface-hover)",
        },
        // Text colors
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          inverse: "var(--text-inverse)",
        },
        // Border colors
        border: {
          primary: "var(--border-primary)",
          secondary: "var(--border-secondary)",
          focus: "var(--border-focus)",
        },
        // Brand colors
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
          light: "var(--color-primary-light)",
        },
        // Status colors
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        info: "var(--color-info)",
        // Backward compatibility
        "background-dark": "var(--bg-secondary)",
        "surface-glass": "var(--surface-primary)",
        "surface-glass-border": "var(--glass-border)",
        "text-secondary": "var(--text-secondary)",
        "border-dark": "#3b544b",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
      },
      boxShadow: {
        glow: "var(--shadow-glow)",
        card: "var(--shadow-card)",
      },
    },
  },
  plugins: [],
};
