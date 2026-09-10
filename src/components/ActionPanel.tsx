"use client";

import gsap from "gsap";
import { useState, useRef, useEffect } from "react";
import {
  Wand2, GitCompare, Eraser, ChevronDown, FileCode, FileCode2,
  MessageSquareX, Loader2, Check, Link2, History, X,
} from "lucide-react";
import { useI18n } from "@/i18n/context";
import { langDot } from "@/lib/langColors";
import type { HistoryEntry } from "@/hooks/useHistory";
import {
  btnPrimary, btnSecondary, btnPrimaryTouch, btnSecondaryTouch,
  btnSecondaryGreen, btnSecondaryGreenTouch,
  popover, popoverItem, kbd as kbdCls, press,
} from "@/lib/ui";
import { useChevronAnimation } from "@/hooks/useChevronAnimation";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.userAgent);
const MOD = isMac ? "⌘" : "Ctrl";

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000)     return "just now";
  if (diff < 3_600_000)  return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

interface HistoryListProps {
  history: HistoryEntry[];
  onClose: () => void;
  onRestore?: (entry: HistoryEntry) => void;
  onRemove?: (id: string) => void;
  onClear?: () => void;
  emptyLabel: string;
  clearLabel: string;
}

function HistoryList({ history, onClose, onRestore, onRemove, onClear, emptyLabel, clearLabel }: HistoryListProps) {
  if (history.length === 0) {
    return <p className="px-3 py-4 text-sm text-fg-faint text-center">{emptyLabel}</p>;
  }
  return (
    <>
      {history.map((entry) => (
        <div key={entry.id} className="flex items-stretch border-t border-line-soft group">
          <button
            type="button"
            onClick={() => { onRestore?.(entry); onClose(); }}
            className={`flex-1 min-w-0 px-3 py-2 text-left hover:bg-hover ${press}`}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span
                aria-hidden
                className="h-[5px] w-[5px] rounded-full shrink-0"
                style={{ background: langDot(entry.lang) }}
              />
              <span className="text-2xs font-mono uppercase text-fg-muted">{entry.lang}</span>
              <span className="text-2xs text-fg-faint ml-auto shrink-0">
                {relativeTime(entry.timestamp)}
              </span>
            </div>
            <p className="text-xs font-mono text-fg-muted truncate leading-snug">
              {entry.input.split("\n")[0].slice(0, 44) || "—"}
            </p>
          </button>
          <button
            type="button"
            onClick={() => onRemove?.(entry.id)}
            className={`px-2 opacity-0 group-hover:opacity-100 focus:opacity-100 text-fg-faint hover:text-danger ${press}`}
            aria-label="Remove from history"
          >
            <X size={11} strokeWidth={2} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => { onClear?.(); onClose(); }}
        className={`w-full h-8 text-2xs text-fg-faint hover:text-danger border-t border-line-soft ${press}`}
      >
        {clearLabel}
      </button>
    </>
  );
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
  isFormatting  = false,
  formatSuccess = false,
  shareCopied   = false,
  history       = [],
  onRestoreHistory,
  onRemoveHistory,
  onClearHistory,
}: ActionPanelProps) {
  const { t } = useI18n();
  const [uncommentOpen,       setUncommentOpen]       = useState(false);
  const [mobileUncommentOpen, setMobileUncommentOpen] = useState(false);
  const [historyOpen,         setHistoryOpen]         = useState(false);
  const [mobileHistoryOpen,   setMobileHistoryOpen]   = useState(false);
  const [uncommentDone,       setUncommentDone]       = useState(false);

  const uncommentWrapRef          = useRef<HTMLDivElement>(null);
  const uncommentPopoverRef       = useRef<HTMLDivElement>(null);
  const mobileUncommentWrapRef    = useRef<HTMLDivElement>(null);
  const mobileUncommentPopoverRef = useRef<HTMLDivElement>(null);
  const historyWrapRef            = useRef<HTMLDivElement>(null);
  const historyPopoverRef         = useRef<HTMLDivElement>(null);
  const mobileHistoryWrapRef      = useRef<HTMLDivElement>(null);
  const mobileHistoryPopoverRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (uncommentWrapRef.current && !uncommentWrapRef.current.contains(e.target as Node))
        setUncommentOpen(false);
      if (mobileUncommentWrapRef.current && !mobileUncommentWrapRef.current.contains(e.target as Node))
        setMobileUncommentOpen(false);
      if (historyWrapRef.current && !historyWrapRef.current.contains(e.target as Node))
        setHistoryOpen(false);
      if (mobileHistoryWrapRef.current && !mobileHistoryWrapRef.current.contains(e.target as Node))
        setMobileHistoryOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const uncommentChevronRef       = useChevronAnimation(uncommentOpen);
  const mobileUncommentChevronRef = useChevronAnimation(mobileUncommentOpen);
  const historyChevronRef         = useChevronAnimation(historyOpen);
  const mobileHistoryChevronRef   = useChevronAnimation(mobileHistoryOpen);

  useIsomorphicLayoutEffect(() => {
    if (uncommentOpen && uncommentPopoverRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(uncommentPopoverRef.current,
          { opacity: 0, y: -4, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.1, ease: "power2.out" }
        );
      });
      return () => ctx.revert();
    }
  }, [uncommentOpen]);

  useIsomorphicLayoutEffect(() => {
    if (mobileUncommentOpen && mobileUncommentPopoverRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(mobileUncommentPopoverRef.current,
          { opacity: 0, y: -4, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.1, ease: "power2.out" }
        );
      });
      return () => ctx.revert();
    }
  }, [mobileUncommentOpen]);

  useIsomorphicLayoutEffect(() => {
    if (historyOpen && historyPopoverRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(historyPopoverRef.current,
          { opacity: 0, y: -4, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.1, ease: "power2.out" }
        );
      });
      return () => ctx.revert();
    }
  }, [historyOpen]);

  useIsomorphicLayoutEffect(() => {
    if (mobileHistoryOpen && mobileHistoryPopoverRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(mobileHistoryPopoverRef.current,
          { opacity: 0, y: -4, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.1, ease: "power2.out" }
        );
      });
      return () => ctx.revert();
    }
  }, [mobileHistoryOpen]);

  const handleUncomment = (type: "html" | "js") => {
    onRemoveComments(type);
    setUncommentOpen(false);
    setMobileUncommentOpen(false);
    setUncommentDone(true);
    setTimeout(() => setUncommentDone(false), 1500);
  };

  const FmtIcon = isFormatting ? Loader2 : formatSuccess ? Check : Wand2;
  const UcIcon  = uncommentDone ? Check : MessageSquareX;
  const wide    = "w-full justify-between";

  return (
    <>
      {/* ── MOBILE ─────────────────────────────────────────────────────── */}
      <div className="md:hidden w-full grid grid-cols-2 gap-2">
        {/* Format */}
        <button
          type="button"
          onClick={onFormat}
          disabled={isFormatting}
          className={`col-span-2 ${btnPrimaryTouch}`}
        >
          <FmtIcon size={14} strokeWidth={2} className={isFormatting ? "animate-spin" : ""} />
          {isFormatting ? t("formatting") : t("formatCode")}
        </button>

        {/* Compare */}
        <button type="button" onClick={onCompare} className={btnSecondaryGreenTouch}>
          <GitCompare size={14} strokeWidth={1.75} />
          {t("compareCode")}
        </button>

        {/* Share */}
        <button type="button" onClick={onShare} className={btnSecondaryTouch}>
          {shareCopied
            ? <Check size={14} strokeWidth={2.25} className="text-success" />
            : <Link2 size={14} strokeWidth={1.75} />}
          <span className={shareCopied ? "text-success" : ""}>
            {shareCopied ? t("shareLinkCopied") : t("shareCode")}
          </span>
        </button>

        {/* Remove Comments */}
        <div
          ref={mobileUncommentWrapRef}
          className="relative"
          onKeyDown={(e) => { if (e.key === "Escape") setMobileUncommentOpen(false); }}
        >
          <button
            type="button"
            onClick={() => setMobileUncommentOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={mobileUncommentOpen}
            className={`${btnSecondaryTouch} w-full ${uncommentDone ? "text-success" : ""}`}
          >
            <span className="flex items-center gap-2">
              <UcIcon size={14} strokeWidth={1.75} />
              {t("removeComments")}
            </span>
            <ChevronDown ref={mobileUncommentChevronRef} size={12} strokeWidth={2} className="text-fg-faint" />
          </button>
          {mobileUncommentOpen && (
            <div className="absolute left-0 top-full pt-1 w-max min-w-full z-20">
              <div ref={mobileUncommentPopoverRef} className={popover}>
                <button type="button" onClick={() => handleUncomment("html")} className={popoverItem}>
                  <FileCode size={13} strokeWidth={1.75} className="text-fg-muted shrink-0" />
                  {t("removeHtmlComments")}
                </button>
                <button type="button" onClick={() => handleUncomment("js")} className={`${popoverItem} border-t border-line-soft`}>
                  <FileCode2 size={13} strokeWidth={1.75} className="text-fg-muted shrink-0" />
                  {t("removeJsComments")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clear */}
        <button type="button" onClick={onClearAll} className={`${btnSecondaryTouch} hover:text-danger`}>
          <Eraser size={14} strokeWidth={1.75} />
          {t("clearAll")}
        </button>

        {/* History */}
        <div
          ref={mobileHistoryWrapRef}
          className="col-span-2 relative"
          onKeyDown={(e) => { if (e.key === "Escape") setMobileHistoryOpen(false); }}
        >
          <button
            type="button"
            onClick={() => setMobileHistoryOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={mobileHistoryOpen}
            className={`${btnSecondaryTouch} w-full`}
          >
            <span className="flex items-center gap-2">
              <History size={14} strokeWidth={1.75} />
              {t("history")}
            </span>
            <span className="flex items-center gap-1.5">
              {history.length > 0 && (
                <span className="text-2xs font-mono text-fg-faint">{history.length}</span>
              )}
              <ChevronDown ref={mobileHistoryChevronRef} size={12} strokeWidth={2} className="text-fg-faint" />
            </span>
          </button>
          {mobileHistoryOpen && (
            <div className="absolute left-0 top-full pt-1 w-full z-20">
              <div ref={mobileHistoryPopoverRef} className={popover}>
                <HistoryList
                  history={history}
                  onClose={() => setMobileHistoryOpen(false)}
                  onRestore={onRestoreHistory}
                  onRemove={onRemoveHistory}
                  onClear={onClearHistory}
                  emptyLabel={t("historyEmpty")}
                  clearLabel={t("clearHistory")}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── DESKTOP rail ───────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col gap-2 w-[200px] shrink-0 pt-9">
        {/* Format */}
        <button
          type="button"
          onClick={onFormat}
          disabled={isFormatting}
          className={`${btnPrimary} ${wide}`}
        >
          <span className="flex items-center gap-2">
            <FmtIcon size={14} strokeWidth={2} className={isFormatting ? "animate-spin" : ""} />
            {isFormatting ? t("formatting") : t("formatCode")}
          </span>
          {!isFormatting && <kbd className="text-2xs font-mono opacity-65">{MOD}↵</kbd>}
        </button>

        {/* Compare */}
        <button type="button" onClick={onCompare} className={`${btnSecondaryGreen} ${wide}`}>
          <span className="flex items-center gap-2">
            <GitCompare size={14} strokeWidth={1.75} />
            {t("compareCode")}
          </span>
          <kbd className={kbdCls}>{MOD}⇧D</kbd>
        </button>

        {/* Share */}
        <button type="button" onClick={onShare} className={`${btnSecondary} ${wide}`}>
          <span className="flex items-center gap-2">
            {shareCopied
              ? <Check size={14} strokeWidth={2.25} className="text-success" />
              : <Link2 size={14} strokeWidth={1.75} />}
            <span className={shareCopied ? "text-success" : ""}>
              {shareCopied ? t("shareLinkCopied") : t("shareCode")}
            </span>
          </span>
        </button>

        {/* Clear */}
        <button type="button" onClick={onClearAll} className={`${btnSecondary} ${wide} hover:text-danger`}>
          <span className="flex items-center gap-2">
            <Eraser size={14} strokeWidth={1.75} />
            {t("clearAll")}
          </span>
          <kbd className={kbdCls}>{MOD}⇧K</kbd>
        </button>

        <div className="h-px bg-line my-2" />

        {/* Remove Comments */}
        <div
          ref={uncommentWrapRef}
          className="relative"
          onKeyDown={(e) => { if (e.key === "Escape") setUncommentOpen(false); }}
        >
          <button
            type="button"
            onClick={() => setUncommentOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={uncommentOpen}
            className={`${btnSecondary} ${wide} ${uncommentDone ? "text-success" : ""}`}
          >
            <span className="flex items-center gap-2">
              <UcIcon size={14} strokeWidth={1.75} />
              {t("removeComments")}
            </span>
            <ChevronDown ref={uncommentChevronRef} size={12} strokeWidth={2} className="text-fg-faint" />
          </button>
          {uncommentOpen && (
            <div className="absolute left-0 top-full pt-1 w-max min-w-full z-20">
              <div ref={uncommentPopoverRef} className={popover}>
                <button type="button" onClick={() => handleUncomment("html")} className={popoverItem}>
                  <FileCode size={13} strokeWidth={1.75} className="text-fg-muted shrink-0" />
                  {t("removeHtmlComments")}
                </button>
                <button type="button" onClick={() => handleUncomment("js")} className={`${popoverItem} border-t border-line-soft`}>
                  <FileCode2 size={13} strokeWidth={1.75} className="text-fg-muted shrink-0" />
                  {t("removeJsComments")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* History */}
        <div
          ref={historyWrapRef}
          className="relative"
          onKeyDown={(e) => { if (e.key === "Escape") setHistoryOpen(false); }}
        >
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={historyOpen}
            className={`${btnSecondary} ${wide}`}
          >
            <span className="flex items-center gap-2">
              <History size={14} strokeWidth={1.75} />
              {t("history")}
            </span>
            <span className="flex items-center gap-1.5">
              {history.length > 0 && (
                <span className="text-2xs font-mono text-fg-faint">{history.length}</span>
              )}
              <ChevronDown ref={historyChevronRef} size={12} strokeWidth={2} className="text-fg-faint" />
            </span>
          </button>
          {historyOpen && (
            <div className="absolute left-0 top-full pt-1 w-full z-20">
              <div ref={historyPopoverRef} className={popover}>
                <HistoryList
                  history={history}
                  onClose={() => setHistoryOpen(false)}
                  onRestore={onRestoreHistory}
                  onRemove={onRemoveHistory}
                  onClear={onClearHistory}
                  emptyLabel={t("historyEmpty")}
                  clearLabel={t("clearHistory")}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
