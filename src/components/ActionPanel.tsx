"use client";

import gsap from "gsap";
import { useState, useRef } from "react";
import {
  Wand2, GitCompare, Eraser, ChevronDown, FileCode, FileCode2,
  MessageSquareX, Loader2, Check, Link2, History, X, MoreHorizontal,
} from "lucide-react";
import { useI18n } from "@/i18n/context";
import { langDot } from "@/lib/langColors";
import type { HistoryEntry } from "@/hooks/useHistory";
import {
  btnPrimary, btnSecondary, btnPrimaryTouch, btnSecondaryTouch,
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
  const [uncommentOpen, setUncommentOpen] = useState(false);
  const [historyOpen,   setHistoryOpen]   = useState(false);
  const [moreOpen,      setMoreOpen]      = useState(false);
  const [uncommentDone, setUncommentDone] = useState(false);

  const uncommentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moreTimer      = useRef<ReturnType<typeof setTimeout> | null>(null);

  const uncommentPopoverRef = useRef<HTMLDivElement>(null);
  const morePopoverRef      = useRef<HTMLDivElement>(null);
  const mobileMoreRef       = useRef<HTMLDivElement>(null);

  const moreChevronRef         = useChevronAnimation(moreOpen);
  const historyChevronDesktop  = useChevronAnimation(historyOpen);

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
    if (moreOpen && morePopoverRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(morePopoverRef.current,
          { opacity: 0, y: -4, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.1, ease: "power2.out" }
        );
      });
      return () => ctx.revert();
    }
  }, [moreOpen]);

  useIsomorphicLayoutEffect(() => {
    if (moreOpen && mobileMoreRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(mobileMoreRef.current,
          { opacity: 0, y: -4, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.1, ease: "power2.out" }
        );
      });
      return () => ctx.revert();
    }
  }, [moreOpen]);

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

  const FmtIcon = isFormatting ? Loader2 : formatSuccess ? Check : Wand2;
  const UcIcon  = uncommentDone ? Check : MessageSquareX;

  /* ── History list, shared between the mobile sheet and the desktop rail ── */
  const HistoryList = ({ onClose }: { onClose: () => void }) => (
    history.length === 0 ? (
      <p className="px-3 py-4 text-sm text-fg-faint text-center">{t("historyEmpty")}</p>
    ) : (
      <>
        {history.map((entry) => (
          <div key={entry.id} className="flex items-stretch border-t border-line-soft group">
            <button
              type="button"
              onClick={() => { onRestoreHistory?.(entry); onClose(); }}
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
              onClick={() => onRemoveHistory?.(entry.id)}
              className={`px-2 opacity-0 group-hover:opacity-100 focus:opacity-100 text-fg-faint hover:text-danger ${press}`}
              aria-label="Remove from history"
            >
              <X size={11} strokeWidth={2} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => { onClearHistory?.(); onClose(); }}
          className={`w-full h-8 text-2xs text-fg-faint hover:text-danger border-t border-line-soft ${press}`}
        >
          {t("clearHistory")}
        </button>
      </>
    )
  );

  /* Buttons stretch to fill their container in both layouts. */
  const wide = "w-full justify-between";

  return (
    <>
      {/* ── MOBILE ─────────────────────────────────────────────────────── */}
      <div className="md:hidden w-full grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onFormat}
          disabled={isFormatting}
          className={`col-span-2 ${btnPrimaryTouch}`}
        >
          <FmtIcon size={14} strokeWidth={2} className={isFormatting ? "animate-spin" : ""} />
          {isFormatting ? t("formatting") : t("formatCode")}
        </button>

        <button
          type="button"
          onClick={() => handleUncomment("html")}
          className={`${btnSecondaryTouch} ${uncommentDone ? "text-success" : ""}`}
        >
          {uncommentDone ? <Check size={14} strokeWidth={2.25} /> : <FileCode size={14} strokeWidth={1.75} />}
          {t("removeHtmlComments")}
        </button>

        <button
          type="button"
          onClick={() => handleUncomment("js")}
          className={`${btnSecondaryTouch} ${uncommentDone ? "text-success" : ""}`}
        >
          {uncommentDone ? <Check size={14} strokeWidth={2.25} /> : <FileCode2 size={14} strokeWidth={1.75} />}
          {t("removeJsComments")}
        </button>

        <button type="button" onClick={onCompare} className={btnSecondaryTouch}>
          <GitCompare size={14} strokeWidth={1.75} />
          {t("compareCode")}
        </button>

        <button
          type="button"
          onClick={onClearAll}
          className={`${btnSecondaryTouch} hover:text-danger`}
        >
          <Eraser size={14} strokeWidth={1.75} />
          {t("clearAll")}
        </button>

        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          className={`col-span-2 ${btnSecondaryTouch}`}
        >
          <MoreHorizontal size={14} strokeWidth={1.75} />
          {t("more")}
          {history.length > 0 && (
            <span className="text-2xs font-mono text-fg-faint">{history.length}</span>
          )}
        </button>

        {moreOpen && (
          <div ref={mobileMoreRef} className="col-span-2 rounded-md border border-line bg-surface overflow-hidden">
            <button type="button" onClick={onShare} className={popoverItem}>
              {shareCopied
                ? <Check size={14} strokeWidth={2.25} className="text-success" />
                : <Link2 size={14} strokeWidth={1.75} className="text-fg-muted" />}
              <span className={shareCopied ? "text-success" : ""}>
                {shareCopied ? t("shareLinkCopied") : t("shareCode")}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              aria-expanded={historyOpen}
              className={`${popoverItem} justify-between border-t border-line-soft`}
            >
              <span className="flex items-center gap-2.5">
                <History size={14} strokeWidth={1.75} className="text-fg-muted" />
                {t("history")}
              </span>
              <span className="flex items-center gap-1.5">
                {history.length > 0 && (
                  <span className="text-2xs font-mono text-fg-faint">{history.length}</span>
                )}
                <ChevronDown
                  size={12}
                  strokeWidth={2}
                  className={`text-fg-faint transition-transform duration-150 ${historyOpen ? "rotate-180" : ""}`}
                />
              </span>
            </button>

            {historyOpen && (
              <HistoryList onClose={() => { setHistoryOpen(false); setMoreOpen(false); }} />
            )}
          </div>
        )}
      </div>

      {/* ── DESKTOP rail ───────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col gap-1 w-[188px] shrink-0 pt-9">
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
          {!isFormatting && (
            <kbd className="text-2xs font-mono opacity-65">{MOD}↵</kbd>
          )}
        </button>

        <button type="button" onClick={onCompare} className={`${btnSecondary} ${wide}`}>
          <span className="flex items-center gap-2">
            <GitCompare size={14} strokeWidth={1.75} />
            {t("compareCode")}
          </span>
          <kbd className={kbdCls}>{MOD}⇧D</kbd>
        </button>

        <button
          type="button"
          onClick={onClearAll}
          className={`${btnSecondary} ${wide} hover:text-danger`}
        >
          <span className="flex items-center gap-2">
            <Eraser size={14} strokeWidth={1.75} />
            {t("clearAll")}
          </span>
          <kbd className={kbdCls}>{MOD}⇧K</kbd>
        </button>

        <div className="h-px bg-line my-1.5" />

        {/* Remove comments */}
        <div className="relative" onMouseEnter={openUncomment} onMouseLeave={closeUncomment}>
          <button
            type="button"
            aria-expanded={uncommentOpen}
            className={`${btnSecondary} ${wide} ${uncommentDone ? "text-success" : ""}`}
          >
            <span className="flex items-center gap-2">
              <UcIcon size={14} strokeWidth={1.75} />
              {t("removeComments")}
            </span>
            <ChevronDown size={12} strokeWidth={2} className="text-fg-faint" />
          </button>

          {uncommentOpen && (
            <div className={`absolute left-0 top-full pt-1 w-max min-w-full z-20`}>
              <div ref={uncommentPopoverRef} className={popover}>
                <button type="button" onClick={() => handleUncomment("html")} className={popoverItem}>
                  <FileCode size={13} strokeWidth={1.75} className="text-fg-muted shrink-0" />
                  {t("removeHtmlComments")}
                </button>
                <button
                  type="button"
                  onClick={() => handleUncomment("js")}
                  className={`${popoverItem} border-t border-line-soft`}
                >
                  <FileCode2 size={13} strokeWidth={1.75} className="text-fg-muted shrink-0" />
                  {t("removeJsComments")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* More */}
        <div onMouseEnter={openMore} onMouseLeave={closeMore}>
          <button type="button" aria-expanded={moreOpen} className={`${btnSecondary} ${wide}`}>
            <span className="flex items-center gap-2">
              <MoreHorizontal size={14} strokeWidth={1.75} />
              {t("more")}
            </span>
            <span className="flex items-center gap-1.5">
              {history.length > 0 && (
                <span className="text-2xs font-mono text-fg-faint">{history.length}</span>
              )}
              <ChevronDown
                ref={moreChevronRef}
                size={12}
                strokeWidth={2}
                className="text-fg-faint"
              />
            </span>
          </button>

          {moreOpen && (
            <div ref={morePopoverRef} className="mt-1 rounded-md border border-line bg-surface overflow-hidden">
              <button type="button" onClick={onShare} className={popoverItem}>
                {shareCopied
                  ? <Check size={14} strokeWidth={2.25} className="text-success" />
                  : <Link2 size={14} strokeWidth={1.75} className="text-fg-muted" />}
                <span className={shareCopied ? "text-success" : ""}>
                  {shareCopied ? t("shareLinkCopied") : t("shareCode")}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setHistoryOpen((v) => !v)}
                aria-expanded={historyOpen}
                className={`${popoverItem} justify-between border-t border-line-soft`}
              >
                <span className="flex items-center gap-2.5">
                  <History size={14} strokeWidth={1.75} className="text-fg-muted" />
                  {t("history")}
                </span>
                <span className="flex items-center gap-1.5">
                  {history.length > 0 && (
                    <span className="text-2xs font-mono text-fg-faint">{history.length}</span>
                  )}
                  <ChevronDown
                    ref={historyChevronDesktop}
                    size={12}
                    strokeWidth={2}
                    className="text-fg-faint"
                  />
                </span>
              </button>

              {historyOpen && (
                <HistoryList onClose={() => { setHistoryOpen(false); setMoreOpen(false); }} />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
