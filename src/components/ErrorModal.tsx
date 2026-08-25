"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { X, TriangleAlert } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { btnIcon, btnSecondary } from "@/lib/ui";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { useGsapReducedMotion } from "@/hooks/useGsapReducedMotion";

interface ErrorModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export default function ErrorModal({ open, message, onClose }: ErrorModalProps) {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(open);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useGsapReducedMotion();

  useEffect(() => {
    if (open) setIsVisible(true);
  }, [open]);

  useIsomorphicLayoutEffect(() => {
    if (!isVisible) return;
    const ctx = gsap.context(() => {
      if (open) {
        gsap.fromTo(overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: reducedMotion ? 0 : 0.16, ease: "power2.out" }
        );
        gsap.fromTo(panelRef.current,
          { opacity: 0, y: -4, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: reducedMotion ? 0 : 0.14, ease: "power2.out" }
        );
      } else {
        gsap.to(overlayRef.current, { opacity: 0, duration: reducedMotion ? 0 : 0.12 });
        gsap.to(panelRef.current, {
          opacity: 0, y: -3, scale: 0.985,
          duration: reducedMotion ? 0 : 0.10,
          ease: "power2.in",
          onComplete: () => setIsVisible(false),
        });
      }
    });
    return () => ctx.revert();
  }, [open, isVisible, reducedMotion]);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
      onClick={onClose}
      role="alertdialog"
      aria-modal="true"
    >
      <div
        ref={panelRef}
        className="w-full max-w-md rounded-lg border border-line bg-surface shadow-pop overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 h-11 px-3 border-b border-line bg-surface-sunk">
          <div className="flex items-center gap-2 min-w-0">
            <TriangleAlert size={14} strokeWidth={2} className="text-danger shrink-0" />
            <h2 className="text-base font-semibold text-fg truncate">
              {t("errorModalTitle")}
            </h2>
          </div>
          <button onClick={onClose} className={btnIcon} aria-label={t("close")}>
            <X size={14} strokeWidth={1.75} />
          </button>
        </div>

        {/* The parser's own words, verbatim, in the same face as the code. */}
        <div className="p-3">
          <pre className="px-3 py-2.5 rounded-md border border-line bg-surface-sunk text-sm text-fg leading-relaxed whitespace-pre-wrap break-words">
            {message}
          </pre>
        </div>

        <div className="flex justify-end px-3 h-12 items-center border-t border-line bg-surface-sunk">
          <button onClick={onClose} className={btnSecondary}>
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
