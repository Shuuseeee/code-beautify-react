"use client";

import { useEffect, useRef, useState } from "react";
import { Info, X } from "lucide-react";
import { useI18n } from "@/i18n/context";

interface DraftBannerProps {
  onRestore: () => void;
  onDismiss: () => void;
}

const DURATION = 8000;

export function DraftBanner({ onRestore, onDismiss }: DraftBannerProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLSpanElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissedRef = useRef(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function currentScale() {
    const bar = barRef.current;
    if (!bar) return 1;
    const transform = getComputedStyle(bar).transform;
    if (!transform || transform === "none") return 1;
    const m = transform.match(/matrix\(([^)]+)\)/);
    return m ? parseFloat(m[1].split(",")[0]) : 1;
  }

  function drain(ms: number) {
    const bar = barRef.current;
    if (!bar || ms <= 0) return;
    clearTimer();
    // Set transition before rAF so the dismiss timer starts after the frame is committed,
    // keeping the CSS animation and the timeout aligned.
    bar.style.transition = `transform ${ms}ms linear`;
    requestAnimationFrame(() => {
      bar.style.transform = "scaleX(0)";
      timerRef.current = setTimeout(() => {
        dismissedRef.current = true;
        onDismissRef.current();
      }, ms);
    });
  }

  function pause() {
    const bar = barRef.current;
    if (!bar) return;
    const scale = currentScale();
    bar.style.transition = "none";
    bar.style.transform = `scaleX(${scale})`;
    clearTimer();
  }

  function resume() {
    if (dismissedRef.current) return;
    drain(Math.max(100, currentScale() * DURATION));
  }

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 0);
    return () => {
      clearTimeout(show);
      clearTimer();
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const bar = barRef.current;
    if (bar) {
      bar.style.transition = "none";
      bar.style.transform = "scaleX(1)";
    }
    // Small delay so the browser paints the initial state before animating
    const start = setTimeout(() => drain(DURATION), 80);
    return () => {
      clearTimeout(start);
      clearTimer();
    };
  // drain is stable across renders (no deps capture), safe to omit
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-[#c7ddf2] bg-[#d9ebfc] dark:border-[#1e4a6e] dark:bg-[#0d2a40]"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className="flex items-center gap-3 px-4 py-3.5 text-[15px]">
        <Info className="h-5 w-5 shrink-0 text-[#007393] dark:text-[#4db8d4]" strokeWidth={2} />
        <p className="flex-1 text-[15px] text-[#1d1d1d] dark:text-[#c8dae4]">{t("draftFound")}</p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onRestore}
            className="text-[15px] font-medium text-[#02506b] dark:text-[#4db8d4] underline-offset-2 hover:underline transition-colors"
          >
            {t("draftRestore")}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label={t("close")}
            className="text-[#515151] dark:text-[#8baab5] transition-colors hover:text-[#1d1d1d] dark:hover:text-[#c8dae4]"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>
      {/* countdown bar — shrinks from right to left (origin-left scaleX 1→0) */}
      <span
        ref={barRef}
        aria-hidden
        className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-[#1668b8] dark:bg-[#3a8fc4]"
      />
    </div>
  );
}
