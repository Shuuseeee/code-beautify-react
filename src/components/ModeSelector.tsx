"use client";

import { useLayoutEffect, useRef, useState, useCallback } from "react";
import type { DetectedLang } from "@/lib/formatter";
import { useI18n } from "@/i18n/context";

type Mode = "auto" | DetectedLang;

interface ModeSelectorProps {
  mode: Mode;
  detectedLang: DetectedLang | null;
  onChange: (mode: Mode) => void;
}

const MODES: { value: Mode; label: string }[] = [
  { value: "auto",       label: "AUTO" },
  { value: "html",       label: "HTML" },
  { value: "css",        label: "CSS"  },
  { value: "javascript", label: "JS"   },
  { value: "json",       label: "JSON" },
];

// iOS system colors for each language
const LANG_COLOR: Record<string, { tint: string; text: string; textDark: string }> = {
  html:       { tint: "rgba(255, 59,  48,  0.13)", text: "#E0352B",  textDark: "#FF6B63" },
  css:        { tint: "rgba(255, 204, 0,   0.15)", text: "#997A00",  textDark: "#FFD426" },
  javascript: { tint: "rgba(52,  199, 89,  0.13)", text: "#25A244",  textDark: "#3DD869" },
  json:       { tint: "rgba(0,   122, 255, 0.13)", text: "#007AFF",  textDark: "#409CFF" },
};

export default function ModeSelector({ mode, detectedLang, onChange }: ModeSelectorProps) {
  const { t, locale } = useI18n();
  const buttonRefs  = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const [pressing, setPressing] = useState<Mode | null>(null);
  const [hovering, setHovering] = useState<Mode | null>(null);
  const initialized = useRef(false);

  const isActive = useCallback(
    (m: Mode) => {
      if (m === "auto") return mode === "auto";
      if (mode === "auto") return m === detectedLang;
      return m === mode;
    },
    [mode, detectedLang]
  );

  // Re-measure whenever mode, detectedLang, OR locale changes
  // (locale changes button text width → pill needs to refit)
  useLayoutEffect(() => {
    const activeIndex = MODES.findIndex((m) => isActive(m.value));
    const btn = buttonRefs.current[activeIndex];
    if (!btn) return;
    setPill({ left: btn.offsetLeft, width: btn.offsetWidth });
    initialized.current = true;
  }, [mode, detectedLang, isActive, locale]);

  const pillTransition = initialized.current
    ? "left 340ms cubic-bezier(0.34, 1.56, 0.64, 1), width 340ms cubic-bezier(0.34, 1.56, 0.64, 1)"
    : "none";

  // Resolve which language color to use for the active pill
  const activeLang: string | null =
    mode !== "auto" ? mode : detectedLang;
  const activeLangColor = activeLang ? LANG_COLOR[activeLang] ?? null : null;

  const pillBg     = activeLangColor ? activeLangColor.tint : "var(--glass-pill-bg)";
  const pillShadow = activeLangColor
    ? `var(--glass-pill-shadow), inset 0 0 0 0.5px ${activeLangColor.tint}`
    : "var(--glass-pill-shadow)";

  return (
    <div className="flex justify-center">
      <div
        className="relative inline-flex items-center p-1 rounded-2xl select-none"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(28px) saturate(200%)",
          WebkitBackdropFilter: "blur(28px) saturate(200%)",
          border: "1px solid var(--glass-border)",
          boxShadow: "var(--glass-shadow)",
        }}
      >
        {/* Specular top sheen */}
        <div
          className="pointer-events-none absolute inset-x-1 top-0 h-[1.5px] rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.7) 70%, transparent 100%)",
          }}
        />

        {/* Sliding glass pill — colored tint when a language is active */}
        {pill && (
          <div
            className="absolute top-1 bottom-1 rounded-xl"
            style={{
              left:       pill.left,
              width:      pill.width,
              background: pillBg,
              boxShadow:  pillShadow,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              transition: pillTransition,
            }}
          />
        )}

        {/* Hover ghost pill */}
        {hovering && !isActive(hovering) && (() => {
          const idx = MODES.findIndex((m) => m.value === hovering);
          const btn = buttonRefs.current[idx];
          if (!btn) return null;
          return (
            <div
              className="absolute top-1 bottom-1 rounded-xl pointer-events-none"
              style={{
                left:       btn.offsetLeft,
                width:      btn.offsetWidth,
                background: "var(--glass-hover-bg)",
                transition: "opacity 150ms ease",
              }}
            />
          );
        })()}

        {/* Buttons */}
        {MODES.map(({ value, label }, i) => {
          const active  = isActive(value);
          const pressed = pressing === value;

          // Active text: use language color, else default
          const langColor = LANG_COLOR[value];
          const isDarkMode =
            typeof document !== "undefined" &&
            document.documentElement.classList.contains("dark");

          const activeTextColor = active && langColor
            ? (isDarkMode ? langColor.textDark : langColor.text)
            : undefined;

          return (
            <button
              key={value}
              ref={(el) => { buttonRefs.current[i] = el; }}
              onClick={() => onChange(value)}
              onMouseEnter={() => setHovering(value)}
              onMouseLeave={() => setHovering(null)}
              onMouseDown={() => setPressing(value)}
              onMouseUp={() => setPressing(null)}
              onTouchStart={() => setPressing(value)}
              onTouchEnd={() => setPressing(null)}
              className="relative z-10 px-4 py-1.5 text-xs font-semibold font-heading rounded-xl tracking-wider"
              style={{
                color: activeTextColor
                  ? activeTextColor
                  : active
                    ? "var(--glass-text-active)"
                    : "var(--glass-text-inactive)",
                transform: pressed ? "scale(0.93)" : "scale(1)",
                transition:
                  "color 200ms ease, transform 120ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              {value === "auto" ? t("autoDetect") : label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
