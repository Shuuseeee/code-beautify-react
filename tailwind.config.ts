import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        anthro: {
          // iOS system colors
          light: "#FFFFFF",           // systemBackground (light)
          dark: "#000000",            // label (light) / systemBackground (dark)
          mid: "#8E8E93",             // systemGray
          border: "#D1D1D6",          // separator (light)
          surface: "#1C1C1E",         // secondarySystemBackground (dark)
          "dark-border": "#3A3A3C",   // separator (dark)
          orange: "#FF9500",          // systemOrange
          "orange-hover": "#E68600",
          "orange-subtle": "#FFF3E0",
          blue: "#007AFF",            // systemBlue
          "blue-subtle": "#E5F0FF",
          green: "#34C759",           // systemGreen
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
