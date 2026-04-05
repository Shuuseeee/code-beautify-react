"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { Wand2, GitCompare, Eraser, ChevronDown, FileCode, FileCode2, MessageSquareX, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { LANG_COLOR } from "@/lib/langColors";

const JS_PILL = LANG_COLOR.javascript;
const CSS_PILL = LANG_COLOR.css; // macOS yellow (CSS tab in ModeSelector)
/** macOS blue — same as ModeSelector HTML tab after html/json swap */
const FORMAT_PILL = LANG_COLOR.html;
/** macOS red — same as ModeSelector JSON tab after html/json swap */
const CLEAR_PILL = LANG_COLOR.json;

/** Matches ModeSelector active segment: tint fill + glass pill shadow + inset ring */
const comparePillStyle: CSSProperties = {
  background: JS_PILL.tint,
  boxShadow: `var(--glass-pill-shadow), inset 0 0 0 0.5px ${JS_PILL.tint}`,
};

const uncommentPillStyle: CSSProperties = {
  background: CSS_PILL.tint,
  boxShadow: `var(--glass-pill-shadow), inset 0 0 0 0.5px ${CSS_PILL.tint}`,
};

const formatPillStyle: CSSProperties = {
  background: FORMAT_PILL.tint,
  boxShadow: `var(--glass-pill-shadow), inset 0 0 0 0.5px ${FORMAT_PILL.tint}`,
};

const clearPillStyle: CSSProperties = {
  background: CLEAR_PILL.tint,
  boxShadow: `var(--glass-pill-shadow), inset 0 0 0 0.5px ${CLEAR_PILL.tint}`,
};

const pillInteraction =
  "backdrop-blur-[8px] hover:brightness-[1.04] active:brightness-[0.97] transition-[filter,transform] duration-150 active:scale-[0.98]";

const uncommentText = `text-[#997A00] dark:text-[#FFD426] ${pillInteraction}`;
const compareText = `text-[#25A244] dark:text-[#3DD869] ${pillInteraction}`;
const formatText = `text-[#007AFF] dark:text-[#409CFF] ${pillInteraction}`;
const clearText = `text-[#E0352B] dark:text-[#FF6B63] ${pillInteraction}`;

interface ActionPanelProps {
  onFormat: () => void;
  onCompare: () => void;
  onClearAll: () => void;
  onRemoveComments: (type: "html" | "js") => void;
  isFormatting?: boolean;
}

export default function ActionPanel({
  onFormat,
  onCompare,
  onClearAll,
  onRemoveComments,
  isFormatting = false,
}: ActionPanelProps) {
  const { t } = useI18n();
  const [uncommentOpen, setUncommentOpen] = useState(false);

  const mobileBtn =
    "flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold font-heading transition-colors";
  const desktopSecondary =
    "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium font-heading transition-colors";

  return (
    <>
      {/* ── MOBILE layout: 2-column grid ── */}
      <div className="md:hidden w-full grid grid-cols-2 gap-2">
        {/* Format Code — macOS blue (LANG_COLOR.html), spans full width */}
        <button
          type="button"
          onClick={onFormat}
          disabled={isFormatting}
          style={formatPillStyle}
          className={`col-span-2 ${mobileBtn} border-0 ${formatText} disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {isFormatting ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
          <span>{isFormatting ? t("formatting") : t("formatCode")}</span>
        </button>

        {/* Remove HTML comments — macOS yellow (LANG_COLOR.css) */}
        <button
          type="button"
          onClick={() => onRemoveComments("html")}
          style={uncommentPillStyle}
          className={`${mobileBtn} border-0 ${uncommentText}`}
        >
          <FileCode size={14} />
          <span>{t("removeHtmlComments")}</span>
        </button>

        {/* Remove JS comments */}
        <button
          type="button"
          onClick={() => onRemoveComments("js")}
          style={uncommentPillStyle}
          className={`${mobileBtn} border-0 ${uncommentText}`}
        >
          <FileCode2 size={14} />
          <span>{t("removeJsComments")}</span>
        </button>

        {/* Compare — same visual language as ModeSelector JS segment (tint + glass pill) */}
        <button
          onClick={onCompare}
          type="button"
          style={comparePillStyle}
          className={`${mobileBtn} border-0 ${compareText}`}
        >
          <GitCompare size={14} />
          <span>{t("compareCode")}</span>
        </button>

        {/* Clear All — macOS red (LANG_COLOR.json) */}
        <button
          type="button"
          onClick={onClearAll}
          style={clearPillStyle}
          className={`${mobileBtn} border-0 ${clearText}`}
        >
          <Eraser size={14} />
          <span>{t("clearAll")}</span>
        </button>
      </div>

      {/* ── DESKTOP layout: vertical column ── */}
      <div className="hidden md:flex flex-col gap-2 w-44 shrink-0 pt-6 justify-start">
        {/* Format Code */}
        <button
          type="button"
          onClick={onFormat}
          disabled={isFormatting}
          style={formatPillStyle}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-0 text-sm font-semibold font-heading ${formatText} disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {isFormatting ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
          <span>{isFormatting ? t("formatting") : t("formatCode")}</span>
        </button>

        {/* Remove Comments dropdown — macOS yellow */}
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setUncommentOpen(true)}
            onMouseLeave={() => setUncommentOpen(false)}
            style={uncommentPillStyle}
            className={`${desktopSecondary} border-0 justify-center gap-2 ${uncommentText}`}
          >
            <MessageSquareX size={15} />
            <span>{t("removeComments")}</span>
            <ChevronDown size={12} className="opacity-60" />
          </button>
          {uncommentOpen && (
            <div
              onMouseEnter={() => setUncommentOpen(true)}
              onMouseLeave={() => setUncommentOpen(false)}
              className="absolute left-0 top-full mt-1 min-w-full w-max bg-white dark:bg-anthro-surface border border-anthro-border dark:border-anthro-dark-border rounded-xl shadow-lg overflow-hidden z-20"
            >
              <button
                type="button"
                onClick={() => { onRemoveComments("html"); setUncommentOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-heading text-anthro-dark dark:text-anthro-light hover:bg-[rgba(255,204,0,0.12)] dark:hover:bg-[rgba(255,212,38,0.12)] transition-colors"
              >
                <FileCode size={14} className="text-[#997A00] dark:text-[#FFD426] shrink-0" />
                {t("removeHtmlComments")}
              </button>
              <button
                type="button"
                onClick={() => { onRemoveComments("js"); setUncommentOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-heading text-anthro-dark dark:text-anthro-light hover:bg-[rgba(255,204,0,0.12)] dark:hover:bg-[rgba(255,212,38,0.12)] transition-colors"
              >
                <FileCode2 size={14} className="text-[#997A00] dark:text-[#FFD426] shrink-0" />
                {t("removeJsComments")}
              </button>
            </div>
          )}
        </div>

        {/* Compare Code */}
        <button
          onClick={onCompare}
          type="button"
          style={comparePillStyle}
          className={`${desktopSecondary} border-0 ${compareText}`}
        >
          <GitCompare size={15} />
          <span>{t("compareCode")}</span>
        </button>

        {/* Clear All */}
        <button
          type="button"
          onClick={onClearAll}
          style={clearPillStyle}
          className={`${desktopSecondary} border-0 ${clearText}`}
        >
          <Eraser size={15} />
          <span>{t("clearAll")}</span>
        </button>
      </div>
    </>
  );
}
