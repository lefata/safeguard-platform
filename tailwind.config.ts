
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  safelist: [
    { pattern: /bg-school-/, variants: ['hover', 'focus', 'active', 'dark'] },
    { pattern: /text-school-/ },
    { pattern: /border-school-/ },
    { pattern: /from-school-/ },
    { pattern: /to-school-/ },
    { pattern: /ring-school-/ },
    'shadow-school-card',
    'shadow-school-hover',
    'shadow-school-elevated',
    'shadow-soft',
    'animate-fade-in',
    'animate-slide-down',
    'animate-bounce-gentle',
  ],
  theme: {
    extend: {
      colors: {
        school: {
          50: "#f0f7ff",
          100: "#e0efff",
          200: "#c7e0ff",
          300: "#a3caff",
          400: "#7aafff",
          500: "#5490ff",
          600: "#3d77e6",
          700: "#2d5bc4",
          800: "#1e3f8a",
          900: "#152850",
          950: "#0f1a35",
          gold: "#d4af37",
          "gold-light": "#e8c547",
          "gold-dark": "#b8941f",
          emerald: "#10b981",
          "emerald-light": "#d1fae5",
          "emerald-dark": "#047857",
          neutral: "#f8fafc",
          surface: "#ffffff",
          overlay: "#ffffff",
          border: "#e2e8f0",
          "border-dark": "#cbd5e1",
          muted: "#64748b",
          "text-primary": "#0f172a",
          "text-secondary": "#475569",
        },
        risk: {
          low: "#f0fdf4",
          "low-text": "#166534",
          "low-bg": "#dcfce7",
          medium: "#fefce8",
          "medium-text": "#854d0e",
          "medium-bg": "#fef9c3",
          high: "#fff7ed",
          "high-text": "#9a3412",
          "high-bg": "#ffedd5",
          critical: "#fef2f2",
          "critical-text": "#991b1b",
          "critical-bg": "#fee2e2",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "school-card": "0 0 0 1px rgba(30, 64, 175, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04), 0 8px 16px rgba(30, 64, 175, 0.06)",
        "school-hover": "0 0 0 1px rgba(30, 64, 175, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08), 0 16px 32px rgba(30, 64, 175, 0.1)",
        "school-elevated": "0 0 0 1px rgba(0, 0, 0, 0.06), 0 8px 16px rgba(0, 0, 0, 0.1), 0 24px 48px rgba(30, 64, 175, 0.12)",
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.04), 0 10px 20px -2px rgba(0, 0, 0, 0.02)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "bounce-gentle": "bounce-gentle 0.6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
\`\`\`
