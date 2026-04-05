import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        anthro: {
          light: "#faf9f5",
          dark: "#141413",
          mid: "#b0aea5",
          border: "#e8e6dc",
          surface: "#1c1b19",
          "dark-border": "#2a2927",
          orange: "#d97757",
          "orange-hover": "#c86945",
          "orange-subtle": "#f5ebe6",
          blue: "#6a9bcc",
          "blue-subtle": "#e8f0f8",
          green: "#788c5d",
        },
      },
      fontFamily: {
        heading: ["Poppins", "Arial", "sans-serif"],
        body: ["Lora", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
