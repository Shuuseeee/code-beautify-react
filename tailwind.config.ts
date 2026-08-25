import type { Config } from "tailwindcss";

/**
 * Colors are declared as CSS variables in globals.css and surfaced here as
 * semantic Tailwind names. Nothing in the components should reference a raw
 * hex value — swapping the token layer must be enough to reskin the app.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg:            "var(--bg)",
        surface:       "var(--surface)",
        "surface-sunk":  "var(--surface-sunk)",
        "surface-raise": "var(--surface-raise)",

        line:          "var(--border)",
        "line-soft":   "var(--border-soft)",

        fg:            "var(--fg)",
        "fg-muted":    "var(--fg-muted)",
        "fg-faint":    "var(--fg-faint)",

        accent:        "var(--accent)",
        "accent-hover":"var(--accent-hover)",
        "accent-fg":   "var(--accent-fg)",
        "accent-wash": "var(--accent-wash)",

        danger:        "var(--danger)",
        "danger-wash": "var(--danger-wash)",
        success:       "var(--success)",
        "success-wash":"var(--success-wash)",
        warn:          "var(--warn)",

        "diff-add":       "var(--diff-add-bar)",
        "diff-add-fg":    "var(--diff-add-fg)",
        "diff-del":       "var(--diff-del-bar)",
        "diff-del-fg":    "var(--diff-del-fg)",
      },
      backgroundColor: {
        hover:  "var(--hover)",
        active: "var(--active)",
      },
      borderRadius: {
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
      },
      fontFamily: {
        sans: ["Lato", "Arial", "sans-serif"],
        heading: ["Cabin", "Arial", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SF Mono'", "'Fira Code'", "Consolas", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px", letterSpacing: "0.04em" }],
        xs:    ["11px", { lineHeight: "16px" }],
        sm:    ["12px", { lineHeight: "18px" }],
        base:  ["13px", { lineHeight: "20px" }],
        md:    ["14px", { lineHeight: "21px" }],
        lg:    ["16px", { lineHeight: "24px" }],
      },
      boxShadow: {
        pop:  "var(--shadow-pop)",
        hair: "0 0 0 1px var(--border)",
      },
    },
  },
  plugins: [],
};

export default config;
