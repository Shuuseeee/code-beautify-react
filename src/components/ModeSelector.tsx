"use client";

import { useCallback, useState } from "react";
import type { DetectedLang, Mode } from "@/lib/formatter";
import { useI18n } from "@/i18n/context";
import { langDot } from "@/lib/langColors";

interface ModeSelectorProps {
  mode: Mode;
  detectedLang: DetectedLang | null;
  isSnow: boolean;
  onChange: (mode: Mode) => void;
}

const MODES: { value: Mode; label: string }[] = [
  { value: "auto",       label: "AUTO" },
  { value: "html",       label: "HTML" },
  { value: "xml",        label: "XML"  },
  { value: "css",        label: "CSS"  },
  { value: "scss",       label: "SCSS" },
  { value: "javascript", label: "JS"   },
  { value: "json",       label: "JSON" },
];

export default function ModeSelector({ mode, detectedLang, isSnow, onChange }: ModeSelectorProps) {
  const { t } = useI18n();
  const [hovered, setHovered] = useState<Mode | null>(null);

  const isActive = useCallback(
    (m: Mode) => {
      if (m === "auto") return mode === "auto";
      if (mode === "auto") return m === detectedLang;
      return m === mode;
    },
    [mode, detectedLang]
  );

  return (
    <div className="flex items-center justify-between gap-3 border-b border-line pb-0">
      {/* Tab strip — DeveloperNav structure, pure CSS bars */}
      <div
        role="tablist"
        aria-label={t("languageMode")}
        className="flex h-10 items-stretch gap-7 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
        onMouseLeave={() => setHovered(null)}
      >
        {MODES.map(({ value, label }) => {
          const active = isActive(value);
          const isHov  = hovered === value;
          return (
            <button
              key={value}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(value)}
              onMouseEnter={() => setHovered(value)}
              className={`relative flex items-center whitespace-nowrap text-[15px] transition-colors ${
                active
                  ? "font-medium text-fg"
                  : "font-normal text-fg-muted hover:text-fg"
              }`}
            >
              {value === "auto" ? t("autoDetect") : label}

              {/* Bar: grows from center — accent when active, line on hover */}
              <span
                aria-hidden
                className={`pointer-events-none absolute bottom-0 inset-x-0 h-[4px] origin-center transition-transform duration-300 ease-in-out ${
                  active || isHov ? "scale-x-100" : "scale-x-0"
                } ${active ? "bg-[#63df4e]" : "bg-line"}`}
              />
            </button>
          );
        })}
      </div>

      {/* Detection readout */}
      {mode === "auto" && (isSnow || detectedLang) && (
        <span className="hidden sm:flex shrink-0 items-center gap-1.5 text-sm text-fg-faint">
          {isSnow ? (
            <>
              <span aria-hidden className="h-[6px] w-[6px] rounded-full" style={{ background: "#63df4e" }} />
              ServiceNow
            </>
          ) : (
            <>
              <span aria-hidden className="h-[6px] w-[6px] rounded-full" style={{ background: langDot(detectedLang) }} />
              {detectedLang}
            </>
          )}
        </span>
      )}
    </div>
  );
}
