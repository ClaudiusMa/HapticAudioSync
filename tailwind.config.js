import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      sm: "375px",
      md: "768px",
      xl: "1367px",
    },
    extend: {
      fontFamily: {
        sans: [
          "SF Pro",
          "Noto Sans",
          "Helvetica Neue",
          "Helvetica",
          "Roboto",
          "segoe ui",
          "sans-serif",
        ],
        serif: ["Georgia", "Baskerville", "serif"],
      },
      fontWeight: {
        book: "400",
        medium: "500",
        bold: "700",
      },
      boxShadow: {
        hover: "0 8px 30px rgb(0,0,0,0.12)",
        photo: "0 4px 6px -1px rgb(120, 121, 123, 0.5)",
      },
      colors: {
        bg: "#FFFFFF",
        surface: "#F9F7F7",
        "surface-dark": "#111112",
        "surface-dark-var": "#333030",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        "primary-var": "#B86070",
        brand: "#A4384D",
        "on-bg": "#605E5E",
        "on-bg-var": "#111112",
        "on-bg-dark": "#939090",
        "on-bg-dark-var": "#E4E4E8",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        title: "var(--title)",
        paragraph: "var(--paragraph)",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        title: "var(--title)",
        paragraph: "var(--paragraph)",
      },
      borderWidth: {
        0.1: "0.9px",
      },
      maxWidth: {
        xxl: "1500px",
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
