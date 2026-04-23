"use client";

import type { CSSProperties } from "react";
import { useState, useRef } from "react";
import {
  Wand2, GitCompare, Eraser, ChevronDown, FileCode, FileCode2,
  MessageSquareX, Loader2, Check, Link2, History, RotateCcw, X, MoreHorizontal,
} from "lucide-react";
import { useI18n } from "@/i18n/context";
import { LANG_COLOR } from "@/lib/langColors";
import type { HistoryEntry } from "@/hooks/useHistory";

const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.userAgent);
const MOD = isMac ? "⌘" : "Ctrl";

const FORMAT_PILL = LANG_COLOR.html;
const JS_PILL     = LANG_COLOR.javascript;

// Only the primary Format CTA keeps a filled pill style
const formatPillStyle: CSSProperties = {
  background: FORMAT_PILL.tint,
  boxShadow: `var(--glass-pill-shadow), inset 0 0 0 0.5px ${FORMAT_PILL.tint}`,
};
const successPillStyle: CSSProperties = {
  background: JS_PILL.tint,
  boxShadow: `var(--glass-pill-shadow), inset 0 0 0 0.5px ${JS_PILL.tint}`,
};

const interaction = "transition-[opacity,background,transform] duration-150 active:scale-[0.97]";

// Primary CTA
const formatText  = `text-[#007AFF] dark:text-[#409CFF] backdrop-blur-[8px] hover:brightness-[1.04] active:brightness-[0.97] transition-[filter,transform] duration-150 active:scale-[0.98]`;
const successText = `text-[#25A244] dark:text-[#3DD869] backdrop-blur-[8px] hover:brightness-[1.04] active:brightness-[0.97] transition-[filter,transform] duration-150 active:scale-[0.98]`;

// All secondary buttons: unified neutral — only color is Format blue
const secondaryText = `text-anthro-mid hover:text-anthro-dark dark:hover:text-anthro-light hover:bg-black/[0.04] dark:hover:bg-white/[0.05] ${interaction}`;
// Destructive hover only on clear
const clearHoverText = `text-anthro-mid hover:text-[#FF3B30] dark:hover:text-[#FF453A] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] ${interaction}`;

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
  onRemoveHistory?: (id: string) => void;
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
  onRemoveHistory,
  onClearHistory,
}: ActionPanelProps) {
  const { t } = useI18n();
  const [uncommentOpen, setUncommentOpen] = useState(false);
  const [historyOpen,   setHistoryOpen]   = useState(false);
  const [moreOpen,      setMoreOpen]      = useState(false);
  const [uncommentDone, setUncommentDone] = useState(false);

  const uncommentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moreTimer      = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openUncomment  = () => { if (uncommentTimer.current) clearTimeout(uncommentTimer.current); setUncommentOpen(true); };
  const closeUncomment = () => { uncommentTimer.current = setTimeout(() => setUncommentOpen(false), 120); };
  const openMore       = () => { if (moreTimer.current) clearTimeout(moreTimer.current); setMoreOpen(true); };
  const closeMore      = () => { moreTimer.current = setTimeout(() => { setMoreOpen(false); setHistoryOpen(false); }, 200); };

  const handleUncomment = (type: "html" | "js") => {
    onRemoveComments(type);
    setUncommentOpen(false);
    setUncommentDone(true);
    setTimeout(() => setUncommentDone(false), 1500);
  };

  const mobileBtn =
    "flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold font-heading transition-colors";
  const desktopSecondary =
    "w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium font-heading";

  const fmtPillStyle = formatSuccess ? successPillStyle : formatPillStyle;
  const fmtTextClass = formatSuccess ? successText      : formatText;
  const FmtIcon = isFormatting ? Loader2 : formatSuccess ? Check : Wand2;

  const ucPillStyle = uncommentDone ? successPillStyle : undefined;
  const ucTextClass = uncommentDone ? successText      : secondaryText;
  const UcIcon      = uncommentDone ? Check            : MessageSquareX;

  // Shared history list (reused in both mobile and desktop)
  const HistoryList = ({ onClose }: { onClose: () => void }) => (
    history.length === 0 ? (
      <p className="px-4 py-3 text-xs text-anthro-mid text-center">{t("historyEmpty")}</p>
    ) : (
      <>
        {history.map((entry) => (
          <div key={entry.id} className="flex items-center border-t border-black/[0.04] dark:border-white/[0.06] group">
            <button
              type="button"
              onClick={() => { onRestoreHistory?.(entry); onClose(); }}
              className="flex-1 flex items-start gap-2 px-3 py-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors text-left"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span
                    className="text-[10px] font-mono font-semibold uppercase"
                    style={{ color: LANG_COLOR[entry.lang as keyof typeof LANG_COLOR]?.text ?? "#888" }}
                  >
                    {entry.lang}
                  </span>
                  <span className="text-[10px] text-anthro-mid/50 shrink-0">{relativeTime(entry.timestamp)}</span>
                </div>
                <p className="text-[11px] font-mono text-anthro-dark dark:text-anthro-light truncate opacity-60 leading-snug">
                  {entry.input.split("\n")[0].slice(0, 40) || "—"}
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => onRemoveHistory?.(entry.id)}
              className="opacity-0 group-hover:opacity-100 pr-3 pl-1 py-1 text-anthro-mid/50 hover:text-red-500 transition-all shrink-0"
              title="Remove"
            >
              <X size={11} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => { onClearHistory?.(); onClose(); }}
          className="w-full px-4 py-1.5 text-[10px] font-heading text-anthro-mid/60 hover:text-red-500 transition-colors text-center border-t border-black/[0.04] dark:border-white/[0.06]"
        >
          {t("clearHistory")}
        </button>
      </>
    )
  );

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
          className={`col-span-2 ${mobileBtn} ${fmtTextClass} disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {isFormatting ? <Loader2 size={14} className="animate-spin" /> : formatSuccess ? <Check size={14} /> : <Wand2 size={14} />}
          <span>{isFormatting ? t("formatting") : t("formatCode")}</span>
        </button>

        {/* Remove HTML comments */}
        <button
          type="button"
          onClick={() => handleUncomment("html")}
          style={uncommentDone ? successPillStyle : undefined}
          className={`${mobileBtn} ${uncommentDone ? successText : secondaryText}`}
        >
          {uncommentDone ? <Check size={14} /> : <FileCode size={14} />}
          <span>{t("removeHtmlComments")}</span>
        </button>

        {/* Remove JS comments */}
        <button
          type="button"
          onClick={() => handleUncomment("js")}
          style={uncommentDone ? successPillStyle : undefined}
          className={`${mobileBtn} ${uncommentDone ? successText : secondaryText}`}
        >
          {uncommentDone ? <Check size={14} /> : <FileCode2 size={14} />}
          <span>{t("removeJsComments")}</span>
        </button>

        {/* Compare */}
        <button
          onClick={onCompare}
          type="button"
          className={`${mobileBtn} ${secondaryText}`}
        >
          <GitCompare size={14} />
          <span>{t("compareCode")}</span>
        </button>

        {/* Clear All */}
        <button
          type="button"
          onClick={onClearAll}
          className={`${mobileBtn} ${clearHoverText}`}
        >
          <Eraser size={14} />
          <span>{t("clearAll")}</span>
        </button>

        {/* More (⋯) — expands Share / History */}
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className={`${mobileBtn} ${secondaryText}`}
        >
          <MoreHorizontal size={14} />
          <span>{t("more")}</span>
          {history.length > 0 && (
            <span className="ml-1 text-[10px] font-mono opacity-40">{history.length}</span>
          )}
        </button>

        {moreOpen && (
          <div
            className="col-span-2 rounded-xl overflow-hidden"
            style={{ background: "var(--panel-bg)", border: "1px solid var(--panel-border)" }}
          >
            {/* Share */}
            <button
              type="button"
              onClick={() => { onShare(); }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium font-heading ${secondaryText}`}
            >
              {shareCopied ? <Check size={14} className="text-green-500" /> : <Link2 size={14} />}
              <span className={shareCopied ? "text-green-500" : ""}>{shareCopied ? t("shareLinkCopied") : t("shareCode")}</span>
            </button>
            {/* History toggle */}
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium font-heading border-t border-black/[0.04] dark:border-white/[0.06] ${secondaryText}`}
            >
              <div className="flex items-center gap-2"><History size={14} /><span>{t("history")}</span></div>
              <div className="flex items-center gap-1">
                {history.length > 0 && <span className="text-[10px] font-mono opacity-40">{history.length}</span>}
                <ChevronDown size={12} className={`opacity-40 transition-transform ${historyOpen ? "rotate-180" : ""}`} />
              </div>
            </button>
            {historyOpen && <HistoryList onClose={() => { setHistoryOpen(false); setMoreOpen(false); }} />}
          </div>
        )}
      </div>

      {/* ── DESKTOP layout: vertical column ── */}
      <div className="hidden md:flex flex-col gap-1.5 w-52 shrink-0 pt-6 justify-start">
        {/* Format Code — primary CTA */}
        <button
          type="button"
          onClick={onFormat}
          disabled={isFormatting}
          style={fmtPillStyle}
          className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold font-heading ${fmtTextClass} disabled:opacity-60 disabled:cursor-not-allowed`}
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
            onMouseEnter={openUncomment}
            onMouseLeave={closeUncomment}
            style={ucPillStyle}
            className={`${desktopSecondary} justify-center gap-2 ${ucTextClass}`}
          >
            <UcIcon size={15} />
            <span>{t("removeComments")}</span>
            <ChevronDown size={12} className="opacity-40 ml-auto" />
          </button>
          {uncommentOpen && (
            <div
              onMouseEnter={openUncomment}
              onMouseLeave={closeUncomment}
              className="absolute left-0 top-full mt-1 min-w-full w-max rounded-xl overflow-hidden z-20"
              style={{ background: "var(--panel-bg)", border: "1px solid var(--panel-border)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
            >
              <button
                type="button"
                onClick={() => handleUncomment("html")}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-heading text-anthro-dark dark:text-anthro-light hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
              >
                <FileCode size={14} className="text-anthro-mid shrink-0" />
                {t("removeHtmlComments")}
              </button>
              <button
                type="button"
                onClick={() => handleUncomment("js")}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-heading text-anthro-dark dark:text-anthro-light hover:bg-black/[0.04] dark:hover:bg-white/[0.05] border-t border-black/[0.04] dark:border-white/[0.06] transition-colors"
              >
                <FileCode2 size={14} className="text-anthro-mid shrink-0" />
                {t("removeJsComments")}
              </button>
            </div>
          )}
        </div>

        {/* Compare Code */}
        <button
          onClick={onCompare}
          type="button"
          className={`${desktopSecondary} justify-between ${secondaryText}`}
        >
          <div className="flex items-center gap-2">
            <GitCompare size={15} />
            <span>{t("compareCode")}</span>
          </div>
          <kbd className="text-[10px] font-mono opacity-40 shrink-0">{MOD}⇧D</kbd>
        </button>

        {/* Clear All — moved out of More for quick access */}
        <button
          type="button"
          onClick={onClearAll}
          className={`${desktopSecondary} justify-between ${clearHoverText}`}
        >
          <div className="flex items-center gap-2">
            <Eraser size={15} />
            <span>{t("clearAll")}</span>
          </div>
          <kbd className="text-[10px] font-mono opacity-40 shrink-0">{MOD}⇧K</kbd>
        </button>

        {/* Divider */}
        <div className="my-0.5 border-t border-black/[0.05] dark:border-white/[0.05]" />

        {/* More (⋯) — hover to open: Share + History */}
        <div onMouseEnter={openMore} onMouseLeave={closeMore}>
          <button
            type="button"
            className={`${desktopSecondary} justify-between ${secondaryText}`}
          >
            <div className="flex items-center gap-2">
              <MoreHorizontal size={15} />
              <span>{t("more")}</span>
            </div>
            <div className="flex items-center gap-1">
              {history.length > 0 && <span className="text-[10px] font-mono opacity-40">{history.length}</span>}
              <ChevronDown size={12} className={`opacity-40 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} />
            </div>
          </button>

          {moreOpen && (
            <div className="rounded-xl" style={{ background: "var(--panel-bg)", border: "1px solid var(--panel-border)" }}>
              {/* Share */}
              <button
                type="button"
                onClick={onShare}
                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium font-heading ${secondaryText}`}
              >
                {shareCopied ? <Check size={14} className="text-green-500" /> : <Link2 size={14} />}
                <span className={shareCopied ? "text-green-500" : ""}>{shareCopied ? t("shareLinkCopied") : t("shareCode")}</span>
              </button>
              {/* History — inline expand */}
              <button
                type="button"
                onClick={() => setHistoryOpen((v) => !v)}
                className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium font-heading border-t border-black/[0.04] dark:border-white/[0.06] ${historyOpen ? "" : "rounded-b-xl"} ${secondaryText}`}
              >
                <div className="flex items-center gap-2"><History size={14} /><span>{t("history")}</span></div>
                <div className="flex items-center gap-1">
                  {history.length > 0 && <span className="text-[10px] font-mono opacity-40">{history.length}</span>}
                  <ChevronDown size={12} className={`opacity-40 transition-transform duration-200 ${historyOpen ? "rotate-180" : ""}`} />
                </div>
              </button>
              {historyOpen && (
                <div className="border-t border-black/[0.04] dark:border-white/[0.06] rounded-b-xl overflow-hidden">
                  <HistoryList onClose={() => { setHistoryOpen(false); setMoreOpen(false); }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
