"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { X, Columns2, Rows2, ArrowLeftRight, WrapText } from "lucide-react";
import { useI18n } from "@/i18n/context";
import dynamic from "next/dynamic";
import type * as Monaco from "monaco-editor";
import type { Theme } from "@/hooks/useTheme";
import {
  registerEditorThemes,
  isServiceNowCode,
} from "@/lib/monacoServiceNow";
import { registerServiceNowTypes } from "@/lib/servicenowTypes";
import {
  btnIcon, eyebrow,
  EDITOR_FONT_FAMILY, EDITOR_FONT_SIZE, EDITOR_LINE_HEIGHT,
} from "@/lib/ui";
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
  const [sideBySide, setSideBySide] = useState(true);
  const [wrapLines, setWrapLines] = useState(true);
  const [swapped, setSwapped] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { reducedMotion } = useGsapReducedMotion();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setSwapped(false); // reset swap each time the modal reopens
      // Move focus into the dialog so keyboard users can interact immediately
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    }
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

  const isXml = /^\s*<\?xml\b/.test(original) || /^\s*<\?xml\b/.test(modified) || language === "xml";
  const isSnow = !isXml && (isServiceNowCode(original) || isServiceNowCode(modified));
  const monacoLang = isXml              ? "xml"
    : isSnow                            ? "javascript"
    : language === "javascript"         ? "javascript"
    : language === "typescript"         ? "typescript"
    : language === "json"               ? "json"
    : language === "html"               ? "html"
    : language === "css"                ? "css"
    : language === "scss"               ? "scss"
    : (language ?? "plaintext");
  const monacoTheme = theme === "dark" ? "vs-dark" : "vs";

  // Swap flips which side is original vs. modified (and the header legend).
  const leftText = swapped ? modified : original;
  const rightText = swapped ? original : modified;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/45 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="diff-modal-title"
    >
      <div
        ref={panelRef}
        className="w-full flex flex-col rounded-xl border border-line bg-surface shadow-[0_20px_40px_rgba(0,0,0,0.35)] overflow-hidden"
        style={{ maxWidth: "min(96vw, 1600px)", height: "calc(100vh - 3rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — reads like a file header: what's compared, in what language. */}
        <div className="flex items-center justify-between gap-3 h-11 px-3 border-b border-line bg-surface-sunk shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <h2 id="diff-modal-title" className="text-base font-semibold text-fg truncate">
              {t("compareModalTitle")}
            </h2>
            <span className="px-1.5 h-[18px] inline-flex items-center gap-1 rounded-[4px] border border-line text-2xs font-mono text-fg-muted shrink-0">
              {isSnow && <span aria-hidden className="h-[6px] w-[6px] rounded-full shrink-0" style={{ background: "#63df4e" }} />}
              {isSnow ? "ServiceNow" : monacoLang}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-3">
              <span className={`${eyebrow} flex items-center gap-1.5`}>
                <span aria-hidden className="h-[7px] w-[7px] rounded-[2px] bg-diff-del" />
                {swapped ? t("output") : t("input")}
              </span>
              <span className={`${eyebrow} flex items-center gap-1.5`}>
                <span aria-hidden className="h-[7px] w-[7px] rounded-[2px] bg-diff-add" />
                {swapped ? t("input") : t("output")}
              </span>
            </div>
            <button
              onClick={() => setSwapped((s) => !s)}
              className={btnIcon}
              title={t("swapSides")}
              aria-label={t("swapSides")}
            >
              <ArrowLeftRight size={15} strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setSideBySide((s) => !s)}
              className={btnIcon}
              title={sideBySide ? t("inlineView") : t("sideBySideView")}
              aria-label={sideBySide ? t("inlineView") : t("sideBySideView")}
            >
              {sideBySide
                ? <Rows2 size={15} strokeWidth={1.75} />
                : <Columns2 size={15} strokeWidth={1.75} />}
            </button>
            <button
              onClick={() => setWrapLines((w) => !w)}
              className={`${btnIcon} ${wrapLines ? "text-accent" : ""}`}
              title={t("wrapLines")}
              aria-label={t("wrapLines")}
              aria-pressed={wrapLines}
            >
              <WrapText size={15} strokeWidth={1.75} />
            </button>
            <button ref={closeButtonRef} type="button" onClick={onClose} className={btnIcon} aria-label={t("close")}>
              <X size={15} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <MonacoDiffEditor
            original={leftText}
            modified={rightText}
            language={monacoLang}
            theme={monacoTheme}
            beforeMount={(monaco) => {
              registerServiceNowTypes(monaco);
              registerEditorThemes(monaco);
            }}
            options={{
              readOnly: true,
              automaticLayout: true,
              fontSize: EDITOR_FONT_SIZE,
              lineHeight: EDITOR_LINE_HEIGHT,
              fontFamily: EDITOR_FONT_FAMILY,
              fontLigatures: false,
              renderSideBySide: sideBySide,
              renderOverviewRuler: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbersMinChars: 3,
              lineDecorationsWidth: 6,
              padding: { top: 8, bottom: 12 },
              renderIndicators: true,
              diffWordWrap: wrapLines ? "on" : "off",
              "semanticHighlighting.enabled": true,
              bracketPairColorization: { enabled: true },
              scrollbar: {
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
              },
            } as Monaco.editor.IDiffEditorConstructionOptions}
            height="100%"
          />
        </div>

      </div>
    </div>
  );
}
