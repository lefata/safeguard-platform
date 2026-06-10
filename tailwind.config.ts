import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    // If you have any pages directly under app/ (outside src), add:
    // "./app/**/*.{ts,tsx}",
  ],
  safelist: [
    // Force all school colour utilities
    {
      pattern: /bg-school-/,
      variants: ['hover', 'focus', 'active'],
    },
    {
      pattern: /text-school-/,
    },
    {
      pattern: /from-school-/,
    },
    {
      pattern: /to-school-/,
    },
    {
      pattern: /border-school-/,
    },
    {
      pattern: /ring-school-/,
    },
    // Force custom shadows and animations
    'shadow-school-card',
    'shadow-school-hover',
    'shadow-soft',
    'animate-fade-in',
  ],
  theme: {
    extend: {
      colors: {
        school: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        risk: {
          low: "#f0fdf4",
          "low-text": "#166534",
          medium: "#fefce8",
          "medium-text": "#854d0e",
          high: "#fff7ed",
          "high-text": "#9a3412",
          critical: "#fef2f2",
          "critical-text": "#991b1b",
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "school-card": "0 0 0 1px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.04), 0 12px 24px rgba(0,0,0,0.04)",
        "school-hover": "0 0 0 1px rgba(59,130,246,0.1), 0 4px 6px rgba(0,0,0,0.04), 0 12px 28px rgba(0,0,0,0.06)",
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.04), 0 10px 20px -2px rgba(0, 0, 0, 0.02)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
