"use client";

import { useCallback } from "react";
import type { DetectedLang, Mode } from "@/lib/formatter";
import { useI18n } from "@/i18n/context";
import type { Theme } from "@/hooks/useTheme";
import { langDot } from "@/lib/langColors";
import { segment, segmentItem } from "@/lib/ui";

interface ModeSelectorProps {
  mode: Mode;
  detectedLang: DetectedLang | null;
  onChange: (mode: Mode) => void;
  theme: Theme;
}

const MODES: { value: Mode; label: string }[] = [
  { value: "auto",       label: "AUTO" },
  { value: "html",       label: "HTML" },
  { value: "css",        label: "CSS"  },
  { value: "javascript", label: "JS"   },
  { value: "json",       label: "JSON" },
];

export default function ModeSelector({ mode, detectedLang, onChange }: ModeSelectorProps) {
  const { t } = useI18n();

  const isActive = useCallback(
    (m: Mode) => {
      if (m === "auto") return mode === "auto";
      if (mode === "auto") return m === detectedLang;
      return m === mode;
    },
    [mode, detectedLang]
  );

  return (
    <div className="flex items-center justify-between gap-3">
      <div className={`${segment} overflow-x-auto scrollbar-none`} role="tablist">
        {MODES.map(({ value, label }) => {
          const active = isActive(value);
          return (
            <button
              key={value}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(value)}
              className={`${segmentItem(active)} whitespace-nowrap`}
            >
              
              {value === "auto" ? t("autoDetect") : label}
            </button>
          );
        })}
      </div>

      {/* Detection readout — states what the picker inferred, in words. */}
      {mode === "auto" && detectedLang && (
        <span className="hidden sm:flex items-center gap-1.5 text-sm text-fg-faint shrink-0">
          <span
            aria-hidden
            className="h-[6px] w-[6px] rounded-full"
            style={{ background: langDot(detectedLang) }}
          />
          {detectedLang}
        </span>
      )}
    </div>
  );
}
