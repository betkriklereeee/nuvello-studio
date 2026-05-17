import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui tokens — mapped to CSS vars defined in globals.css
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        // Nuvello design system tokens
        // Usage: bg-nv-accent, text-nv-muted, border-nv-border, etc.
        "nv-bg": "var(--nv-bg)",
        "nv-surface": "var(--nv-surface)",
        "nv-border": "var(--nv-border)",
        "nv-text": "var(--nv-text)",
        "nv-text-secondary": "var(--nv-text-secondary)",
        "nv-muted": "var(--nv-muted)",
        "nv-accent": "var(--nv-accent)",
        "nv-accent-hover": "var(--nv-accent-hover)",
        "nv-accent-light": "var(--nv-accent-light)",
        "nv-accent-subtle": "var(--nv-accent-subtle)",
        "nv-success": "var(--nv-success)",
        "nv-danger": "var(--nv-danger)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
