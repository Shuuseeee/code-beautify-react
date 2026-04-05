"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import {
  Wand2, GitCompare, Eraser, ChevronDown, FileCode, FileCode2,
  MessageSquareX, Loader2, Check, Link2, History, RotateCcw,
} from "lucide-react";
import { useI18n } from "@/i18n/context";
import { LANG_COLOR } from "@/lib/langColors";
import type { HistoryEntry } from "@/hooks/useHistory";

const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.userAgent);
const MOD = isMac ? "⌘" : "Ctrl";

const JS_PILL     = LANG_COLOR.javascript;
const CSS_PILL    = LANG_COLOR.css;
const FORMAT_PILL = LANG_COLOR.html;
const CLEAR_PILL  = LANG_COLOR.json;

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
const successPillStyle: CSSProperties = {
  background: JS_PILL.tint,
  boxShadow: `var(--glass-pill-shadow), inset 0 0 0 0.5px ${JS_PILL.tint}`,
};

const pillInteraction =
  "backdrop-blur-[8px] hover:brightness-[1.04] active:brightness-[0.97] transition-[filter,transform] duration-150 active:scale-[0.98]";

const uncommentText = `text-[#997A00] dark:text-[#FFD426] ${pillInteraction}`;
const compareText   = `text-[#25A244] dark:text-[#3DD869] ${pillInteraction}`;
const formatText    = `text-[#007AFF] dark:text-[#409CFF] ${pillInteraction}`;
const clearText     = `text-[#E0352B] dark:text-[#FF6B63] ${pillInteraction}`;
const successText   = `text-[#25A244] dark:text-[#3DD869] ${pillInteraction}`;
const neutralText   = `text-anthro-mid hover:text-anthro-dark dark:hover:text-anthro-light ${pillInteraction}`;

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000)        return "just now";
  if (diff < 3_600_000)     return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)    return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

interface ActionPanelProps {
  onFormat: () => void;
  onCompare: () => void;
  onClearAll: () => void;
  onRemoveComments: (type: "html" | "js") => void;
  onShare: () => void;
  isFormatting?: boolean;
  formatSuccess?: boolean;
  shareCopied?: boolean;
  history?: HistoryEntry[];
  onRestoreHistory?: (entry: HistoryEntry) => void;
  onClearHistory?: () => void;
}

export default function ActionPanel({
  onFormat,
  onCompare,
  onClearAll,
  onRemoveComments,
  onShare,
  isFormatting     = false,
  formatSuccess    = false,
  shareCopied      = false,
  history          = [],
  onRestoreHistory,
  onClearHistory,
}: ActionPanelProps) {
  const { t } = useI18n();
  const [uncommentOpen,  setUncommentOpen]  = useState(false);
  const [historyOpen,    setHistoryOpen]    = useState(false);
  const [uncommentDone,  setUncommentDone]  = useState(false);

  const handleUncomment = (type: "html" | "js") => {
    onRemoveComments(type);
    setUncommentOpen(false);
    setUncommentDone(true);
    setTimeout(() => setUncommentDone(false), 1500);
  };

  const mobileBtn =
    "flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold font-heading transition-colors";
  const desktopSecondary =
    "w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium font-heading transition-colors";

  // Derive active styles for format button (normal / formatting / success)
  const fmtPillStyle = formatSuccess ? successPillStyle : formatPillStyle;
  const fmtTextClass = formatSuccess ? successText      : formatText;
  const FmtIcon = isFormatting ? Loader2 : formatSuccess ? Check : Wand2;

  // Derive active styles for uncomment button
  const ucPillStyle = uncommentDone ? successPillStyle : uncommentPillStyle;
  const ucTextClass = uncommentDone ? successText      : uncommentText;
  const UcIcon      = uncommentDone ? Check            : MessageSquareX;

  return (
    <>
      {/* ── MOBILE layout: 2-column grid ── */}
      <div className="md:hidden w-full grid grid-cols-2 gap-2">
        {/* Format Code */}
        <button
          type="button"
          onClick={onFormat}
          disabled={isFormatting}
          style={fmtPillStyle}
          className={`col-span-2 ${mobileBtn} border-0 ${fmtTextClass} disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {isFormatting ? <Loader2 size={14} className="animate-spin" /> : formatSuccess ? <Check size={14} /> : <Wand2 size={14} />}
          <span>{isFormatting ? t("formatting") : t("formatCode")}</span>
        </button>

        {/* Remove HTML comments */}
        <button
          type="button"
          onClick={() => handleUncomment("html")}
          style={uncommentDone ? successPillStyle : uncommentPillStyle}
          className={`${mobileBtn} border-0 ${uncommentDone ? successText : uncommentText}`}
        >
          {uncommentDone ? <Check size={14} /> : <FileCode size={14} />}
          <span>{t("removeHtmlComments")}</span>
        </button>

        {/* Remove JS comments */}
        <button
          type="button"
          onClick={() => handleUncomment("js")}
          style={uncommentDone ? successPillStyle : uncommentPillStyle}
          className={`${mobileBtn} border-0 ${uncommentDone ? successText : uncommentText}`}
        >
          {uncommentDone ? <Check size={14} /> : <FileCode2 size={14} />}
          <span>{t("removeJsComments")}</span>
        </button>

        {/* Compare */}
        <button
          onClick={onCompare}
          type="button"
          style={comparePillStyle}
          className={`${mobileBtn} border-0 ${compareText}`}
        >
          <GitCompare size={14} />
          <span>{t("compareCode")}</span>
        </button>

        {/* Clear All */}
        <button
          type="button"
          onClick={onClearAll}
          style={clearPillStyle}
          className={`${mobileBtn} border-0 ${clearText}`}
        >
          <Eraser size={14} />
          <span>{t("clearAll")}</span>
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={onShare}
          className={`${mobileBtn} border border-anthro-border dark:border-anthro-dark-border bg-white dark:bg-anthro-surface ${neutralText}`}
        >
          {shareCopied ? <Check size={14} className="text-green-500" /> : <Link2 size={14} />}
          <span>{shareCopied ? t("shareLinkCopied") : t("shareCode")}</span>
        </button>

        {/* History */}
        <button
          type="button"
          onClick={() => setHistoryOpen((v) => !v)}
          className={`${mobileBtn} border border-anthro-border dark:border-anthro-dark-border bg-white dark:bg-anthro-surface ${neutralText}`}
        >
          <History size={14} />
          <span>{t("history")}</span>
          {history.length > 0 && (
            <span className="ml-auto text-[10px] font-mono opacity-50">{history.length}</span>
          )}
        </button>

        {/* Mobile history dropdown */}
        {historyOpen && (
          <div className="col-span-2 bg-white dark:bg-anthro-surface border border-anthro-border dark:border-anthro-dark-border rounded-xl overflow-hidden shadow-lg">
            {history.length === 0 ? (
              <p className="px-4 py-3 text-xs text-anthro-mid text-center">{t("historyEmpty")}</p>
            ) : (
              <>
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => { onRestoreHistory?.(entry); setHistoryOpen(false); }}
                    className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-anthro-light dark:hover:bg-anthro-dark/40 transition-colors text-left border-b border-anthro-border dark:border-anthro-dark-border last:border-0"
                  >
                    <RotateCcw size={12} className="shrink-0 mt-0.5 text-anthro-mid" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-mono font-semibold uppercase"
                          style={{ color: LANG_COLOR[entry.lang as keyof typeof LANG_COLOR]?.text ?? "#888" }}>
                          {entry.lang}
                        </span>
                        <span className="text-[10px] text-anthro-mid/60">{relativeTime(entry.timestamp)}</span>
                      </div>
                      <p className="text-xs font-mono text-anthro-dark dark:text-anthro-light truncate opacity-70">
                        {entry.input.split("\n")[0].slice(0, 60)}
                      </p>
                    </div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { onClearHistory?.(); setHistoryOpen(false); }}
                  className="w-full px-4 py-2 text-[11px] font-heading text-anthro-mid hover:text-red-500 transition-colors text-center"
                >
                  {t("clearHistory")}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── DESKTOP layout: vertical column ── */}
      <div className="hidden md:flex flex-col gap-2 w-44 shrink-0 pt-6 justify-start">
        {/* Format Code */}
        <button
          type="button"
          onClick={onFormat}
          disabled={isFormatting}
          style={fmtPillStyle}
          className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border-0 text-sm font-semibold font-heading ${fmtTextClass} disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          <div className="flex items-center gap-2">
            <FmtIcon size={15} className={isFormatting ? "animate-spin" : ""} />
            <span>{isFormatting ? t("formatting") : t("formatCode")}</span>
          </div>
          {!isFormatting && (
            <kbd className="text-[10px] font-mono opacity-40 shrink-0">{MOD}↵</kbd>
          )}
        </button>

        {/* Remove Comments dropdown */}
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setUncommentOpen(true)}
            onMouseLeave={() => setUncommentOpen(false)}
            style={ucPillStyle}
            className={`${desktopSecondary} border-0 justify-center gap-2 ${ucTextClass}`}
          >
            <UcIcon size={15} />
            <span>{t("removeComments")}</span>
            <ChevronDown size={12} className="opacity-60 ml-auto" />
          </button>
          {uncommentOpen && (
            <div
              onMouseEnter={() => setUncommentOpen(true)}
              onMouseLeave={() => setUncommentOpen(false)}
              className="absolute left-0 top-full mt-1 min-w-full w-max bg-white dark:bg-anthro-surface border border-anthro-border dark:border-anthro-dark-border rounded-xl shadow-lg overflow-hidden z-20"
            >
              <button
                type="button"
                onClick={() => handleUncomment("html")}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-heading text-anthro-dark dark:text-anthro-light hover:bg-[rgba(255,204,0,0.12)] dark:hover:bg-[rgba(255,212,38,0.12)] transition-colors"
              >
                <FileCode size={14} className="text-[#997A00] dark:text-[#FFD426] shrink-0" />
                {t("removeHtmlComments")}
              </button>
              <button
                type="button"
                onClick={() => handleUncomment("js")}
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
          className={`${desktopSecondary} border-0 justify-between ${compareText}`}
        >
          <div className="flex items-center gap-2">
            <GitCompare size={15} />
            <span>{t("compareCode")}</span>
          </div>
          <kbd className="text-[10px] font-mono opacity-40 shrink-0">{MOD}⇧D</kbd>
        </button>

        {/* Clear All */}
        <button
          type="button"
          onClick={onClearAll}
          style={clearPillStyle}
          className={`${desktopSecondary} border-0 justify-between ${clearText}`}
        >
          <div className="flex items-center gap-2">
            <Eraser size={15} />
            <span>{t("clearAll")}</span>
          </div>
          <kbd className="text-[10px] font-mono opacity-40 shrink-0">{MOD}⇧K</kbd>
        </button>

        {/* Divider */}
        <div className="border-t border-anthro-border dark:border-anthro-dark-border my-0.5" />

        {/* Share Code */}
        <button
          type="button"
          onClick={onShare}
          className={`${desktopSecondary} border-anthro-border dark:border-anthro-dark-border bg-white dark:bg-anthro-surface justify-center gap-2 ${neutralText}`}
        >
          {shareCopied ? <Check size={15} className="text-green-500" /> : <Link2 size={15} />}
          <span className={shareCopied ? "text-green-500" : ""}>
            {shareCopied ? t("shareLinkCopied") : t("shareCode")}
          </span>
        </button>

        {/* History */}
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setHistoryOpen(true)}
            onMouseLeave={() => setHistoryOpen(false)}
            className={`${desktopSecondary} border-anthro-border dark:border-anthro-dark-border bg-white dark:bg-anthro-surface justify-between gap-2 ${neutralText}`}
          >
            <div className="flex items-center gap-2">
              <History size={15} />
              <span>{t("history")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {history.length > 0 && (
                <span className="text-[10px] font-mono opacity-50">{history.length}</span>
              )}
              <ChevronDown size={12} className="opacity-40" />
            </div>
          </button>

          {historyOpen && (
            <div
              onMouseEnter={() => setHistoryOpen(true)}
              onMouseLeave={() => setHistoryOpen(false)}
              className="absolute left-0 top-full mt-1 w-[260px] bg-white dark:bg-anthro-surface border border-anthro-border dark:border-anthro-dark-border rounded-xl shadow-lg overflow-hidden z-20"
            >
              {history.length === 0 ? (
                <p className="px-4 py-3 text-xs text-anthro-mid text-center">{t("historyEmpty")}</p>
              ) : (
                <>
                  {history.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => { onRestoreHistory?.(entry); setHistoryOpen(false); }}
                      className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-anthro-light dark:hover:bg-anthro-dark/40 transition-colors text-left border-b border-anthro-border dark:border-anthro-dark-border last:border-0"
                    >
                      <RotateCcw size={12} className="shrink-0 mt-0.5 text-anthro-mid" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className="text-[10px] font-mono font-semibold uppercase"
                            style={{ color: LANG_COLOR[entry.lang as keyof typeof LANG_COLOR]?.text ?? "#888" }}
                          >
                            {entry.lang}
                          </span>
                          <span className="text-[10px] text-anthro-mid/60">{relativeTime(entry.timestamp)}</span>
                        </div>
                        <p className="text-xs font-mono text-anthro-dark dark:text-anthro-light truncate opacity-70">
                          {entry.input.split("\n")[0].slice(0, 55)}
                        </p>
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => { onClearHistory?.(); setHistoryOpen(false); }}
                    className="w-full px-4 py-2 text-[11px] font-heading text-anthro-mid hover:text-red-500 transition-colors text-center"
                  >
                    {t("clearHistory")}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
