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

        "appbar":           "var(--appbar-bg)",
        "appbar-border":    "var(--appbar-border)",
        "appbar-fg":        "var(--appbar-fg)",
        "appbar-fg-muted":  "var(--appbar-fg-muted)",
        "appbar-hover-fg":  "var(--appbar-hover-fg)",
        "appbar-indicator": "var(--appbar-active-bar)",

        /* ServiceNow brand tokens */
        "sn-topnav":    "var(--sn-topnav)",
        "sn-green":     "var(--sn-green)",
        "sn-green-btn": "var(--sn-green-btn)",
        "sn-ink":       "var(--sn-ink)",
        "sn-ink2":      "var(--sn-ink2)",
        "sn-muted":     "var(--sn-muted)",
        "sn-ondark":    "var(--sn-ondark)",
        "sn-link":      "var(--sn-link)",
        "sn-link2":     "var(--sn-link2)",
        "sn-wash":      "var(--sn-wash)",
        "sn-line":      "var(--sn-line)",
        "sn-navy":      "var(--sn-navy)",
      },
      backgroundColor: {
        hover:  "var(--hover)",
        active: "var(--active)",
        "appbar-hover": "var(--appbar-hover)",
        "appbar-active": "var(--appbar-active)",
      },
      borderRadius: {
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        xl: "14px",
        "2xl": "18px",
      },
      fontFamily: {
        sans: ["Inter", "Arial", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SF Mono'", "'Fira Code'", "Consolas", "monospace"],
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "16px", letterSpacing: "0.04em" }],
        xs:    ["12px", { lineHeight: "17px" }],
        sm:    ["13px", { lineHeight: "19px" }],
        base:  ["14px", { lineHeight: "21px" }],
        md:    ["15px", { lineHeight: "22px" }],
        lg:    ["17px", { lineHeight: "26px" }],
      },
      boxShadow: {
        pop:   "var(--shadow-pop)",
        modal: "var(--shadow-modal)",
        hair:  "0 0 0 1px var(--border)",
      },
    },
  },
  plugins: [],
};

export default config;
