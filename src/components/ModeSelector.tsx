"use client";

import { useCallback, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { DetectedLang, Mode } from "@/lib/formatter";
import { useI18n } from "@/i18n/context";
import type { Theme } from "@/hooks/useTheme";
import { langDot } from "@/lib/langColors";
import { segment, segmentItem } from "@/lib/ui";

gsap.registerPlugin(useGSAP);

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

  const tablistRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isActive = useCallback(
    (m: Mode) => {
      if (m === "auto") return mode === "auto";
      if (mode === "auto") return m === detectedLang;
      return m === mode;
    },
    [mode, detectedLang]
  );

  // Derive the active index for the GSAP indicator
  const activeIndex = MODES.findIndex(({ value }) => isActive(value));

  useGSAP(() => {
    const activeTab = tabRefs.current[activeIndex];
    const indicator = indicatorRef.current;
    const tablist = tablistRef.current;
    if (!activeTab || !indicator || !tablist) return;

    const listRect = tablist.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    const x = tabRect.left - listRect.left;
    const w = tabRect.width;

    const isFirst = indicator.dataset.initialized !== "true";
    if (isFirst) {
      gsap.set(indicator, { x, width: w });
      indicator.dataset.initialized = "true";
    } else {
      gsap.to(indicator, { x, width: w, duration: 0.3, ease: "power2.out" });
    }
  }, { scope: tablistRef, dependencies: [activeIndex] });

  return (
    <div className="flex items-center justify-between gap-3">
      <div
        ref={tablistRef}
        className={`relative ${segment} overflow-x-auto scrollbar-none`}
        role="tablist"
      >
        {MODES.map(({ value, label }, i) => {
          const active = isActive(value);
          return (
            <button
              key={value}
              ref={(el) => { tabRefs.current[i] = el; }}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(value)}
              className={`${segmentItem(active)} whitespace-nowrap`}
            >
              {value === "auto" ? t("autoDetect") : label}
            </button>
          );
        })}
        {/* GSAP-driven sliding indicator — mirrors Header.tsx pattern */}
        <div
          ref={indicatorRef}
          aria-hidden
          className="absolute bottom-0 h-[2px] bg-accent rounded-full pointer-events-none"
        />
      </div>

      {/* Detection readout */}
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
