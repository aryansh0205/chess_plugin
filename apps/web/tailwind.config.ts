import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontWeight: {
        normal: String(400),
        medium: String(500),
        semibold: String(600),
        bold: String(700),
      },
      colors: {
        page: "rgb(var(--color-page))",
        surface: "rgb(var(--color-surface))",
        border: "rgb(var(--color-border))",
        fg: "rgb(var(--color-fg))",
        "fg-muted": "rgb(var(--color-fg-muted))",
        accent: "rgb(var(--color-accent))",
        banner: {
          bg: "rgb(var(--color-banner-bg))",
          border: "rgb(var(--color-banner-border))",
          fg: "rgb(var(--color-banner-fg))",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
