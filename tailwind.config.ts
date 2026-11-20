import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        line: "var(--line)",
        ink: "var(--text)",
        "ink-2": "var(--text-2)",
        coral: "var(--coral)",
        "on-coral": "var(--on-coral)",
        "teal-900": "var(--teal-900)",
        "teal-800": "var(--teal-800)",
        "teal-600": "var(--teal-600)",
        ok: "var(--ok)",
        "ok-wash": "var(--ok-wash)",
        almost: "var(--almost)",
        "almost-text": "var(--almost-text)",
        "almost-wash": "var(--almost-wash)",
        work: "var(--work)",
        "work-text": "var(--work-text)",
        "work-wash": "var(--work-wash)",
      },
      fontFamily: {
        ui: ["var(--font-ui)"],
        display: ["var(--font-display)"],
        ipa: ["var(--font-ipa)"],
      },
      borderRadius: {
        card: "var(--r-card)",
        control: "var(--r-control)",
        pill: "var(--r-pill)",
      },
    },
  },
  plugins: [],
};

export default config;
