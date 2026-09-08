"use client";

import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { DetectedLang, Mode } from "@/lib/formatter";
import { useI18n } from "@/i18n/context";
import { langDot } from "@/lib/langColors";

gsap.registerPlugin(useGSAP);

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

export default function ModeSelector({ mode, detectedLang, onChange }: ModeSelectorProps) {
  const { t, locale } = useI18n();
  const [hovered, setHovered] = useState<Mode | null>(null);

  const isActive = useCallback(
    (m: Mode) => {
      if (m === "auto") return mode === "auto";
      if (mode === "auto") return m === detectedLang;
      return m === mode;
    },
    [mode, detectedLang]
  );

  const activeIndex = MODES.findIndex(({ value }) => isActive(value));

  // GSAP sliding indicator — mirrors GlobalNav indicator pattern
  const stripRef = useRef<HTMLDivElement>(null);
  const indRef   = useRef<HTMLSpanElement>(null);
  const tabRefs  = useRef<(HTMLButtonElement | null)[]>([]);

  useGSAP(() => {
    const activeTab = tabRefs.current[activeIndex];
    const ind       = indRef.current;
    const strip     = stripRef.current;
    if (!activeTab || !ind || !strip) return;

    const measure = (animate: boolean) => {
      const sr = strip.getBoundingClientRect();
      const tr = activeTab.getBoundingClientRect();
      const x  = tr.left - sr.left;
      const w  = tr.width;
      if (animate) {
        gsap.to(ind, { x, width: w, duration: 0.3, ease: "power2.out" });
      } else {
        gsap.set(ind, { x, width: w });
      }
    };

    const isFirst = ind.dataset.initialized !== "true";
    if (isFirst) {
      document.fonts.ready.then(() => {
        measure(false);
        ind.dataset.initialized = "true";
        ind.dataset.locale = locale;
      });
    } else if (ind.dataset.locale !== locale) {
      measure(false);
      ind.dataset.locale = locale;
    } else {
      measure(true);
    }
  }, { scope: stripRef, dependencies: [activeIndex, locale] });

  return (
    <div className="flex items-center justify-between gap-3">
      {/* Tab strip — DeveloperNav structure + GSAP sliding indicator */}
      <div
        ref={stripRef}
        className="relative flex h-10 items-stretch gap-7 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
        onMouseLeave={() => setHovered(null)}
      >
        {MODES.map(({ value, label }, i) => {
          const active = isActive(value);
          const isHov  = hovered === value;
          return (
            <button
              key={value}
              ref={(el) => { tabRefs.current[i] = el; }}
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

              {/* Hover indicator (non-active only) — static grey bar */}
              {!active && isHov && (
                <span className="absolute -bottom-[1px] left-0 right-0 h-[3px] rounded-full bg-line" />
              )}
            </button>
          );
        })}

        {/* GSAP-driven active indicator */}
        <span
          ref={indRef}
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-[3px] rounded-full bg-accent"
        />
      </div>

      {/* Detection readout */}
      {mode === "auto" && detectedLang && (
        <span className="hidden sm:flex shrink-0 items-center gap-1.5 text-sm text-fg-faint">
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
