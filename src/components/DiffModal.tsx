"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/i18n/context";
import dynamic from "next/dynamic";
import type { Theme } from "@/hooks/useTheme";
import {
  registerServiceNowLanguage,
  registerEditorThemes,
  isServiceNowCode,
} from "@/lib/monacoServiceNow";
import { btnIcon, btnSecondary, eyebrow } from "@/lib/ui";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { useGsapReducedMotion } from "@/hooks/useGsapReducedMotion";

const MonacoDiffEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.DiffEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center text-base text-fg-faint">
        Loading editor…
      </div>
    ),
  }
);

interface DiffModalProps {
  open: boolean;
  original: string;
  modified: string;
  language: string;
  theme: Theme;
  onClose: () => void;
}

export default function DiffModal({
  open,
  original,
  modified,
  language,
  theme,
  onClose,
}: DiffModalProps) {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(open);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useGsapReducedMotion();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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

  const isSnow = isServiceNowCode(original) || isServiceNowCode(modified);
  const monacoLang = isSnow
    ? "servicenow"
    : language === "html" ? "html"
    : language === "css"  ? "css"
    : language === "json" ? "json"
    : "javascript";
  const monacoTheme = isSnow
    ? (theme === "dark" ? "pierre-snow-dark" : "pierre-snow-light")
    : (theme === "dark" ? "pierre-dark" : "pierre-light");

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/45 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={panelRef}
        className="w-full flex flex-col rounded-lg border border-line bg-surface shadow-pop overflow-hidden"
        style={{ maxWidth: "min(96vw, 1600px)", height: "calc(100vh - 3rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — reads like a file header: what's compared, in what language. */}
        <div className="flex items-center justify-between gap-3 h-11 px-3 border-b border-line bg-surface-sunk shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <h2 className="text-base font-semibold text-fg truncate">
              {t("compareModalTitle")}
            </h2>
            <span className="px-1.5 h-[18px] inline-flex items-center rounded-[4px] border border-line text-2xs font-mono text-fg-muted shrink-0">
              {isSnow ? "ServiceNow" : monacoLang}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-3">
              <span className={`${eyebrow} flex items-center gap-1.5`}>
                <span aria-hidden className="h-[7px] w-[7px] rounded-[2px] bg-diff-del" />
                {t("input")}
              </span>
              <span className={`${eyebrow} flex items-center gap-1.5`}>
                <span aria-hidden className="h-[7px] w-[7px] rounded-[2px] bg-diff-add" />
                {t("output")}
              </span>
            </div>
            <button onClick={onClose} className={btnIcon} aria-label={t("close")}>
              <X size={15} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <MonacoDiffEditor
            original={original}
            modified={modified}
            language={monacoLang}
            theme={monacoTheme}
            beforeMount={(monaco) => {
              registerServiceNowLanguage(monaco);
              registerEditorThemes(monaco);
            }}
            options={{
              readOnly: true,
              automaticLayout: true,
              fontSize: 12,
              lineHeight: 20,
              fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', Consolas, monospace",
              fontLigatures: false,
              renderSideBySide: true,
              renderOverviewRuler: false,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbersMinChars: 3,
              lineDecorationsWidth: 6,
              padding: { top: 8, bottom: 12 },
              renderIndicators: true,
              diffWordWrap: "on",
              scrollbar: {
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
              },
            }}
            height="100%"
          />
        </div>

        <div className="flex justify-end px-3 h-12 items-center border-t border-line bg-surface-sunk shrink-0">
          <button onClick={onClose} className={btnSecondary}>
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
