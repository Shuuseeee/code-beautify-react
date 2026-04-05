"use client";

import { useState } from "react";
import { Wand2, GitCompare, Eraser, ChevronDown, FileCode, FileCode2, MessageSquareX, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/context";

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
        {/* Format Code — primary, spans full width */}
        <button
          onClick={onFormat}
          disabled={isFormatting}
          className={`col-span-2 ${mobileBtn} bg-[#007AFF] hover:bg-[#0066CC] text-white shadow-sm disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {isFormatting ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
          <span>{isFormatting ? t("formatting") : t("formatCode")}</span>
        </button>

        {/* Remove HTML comments */}
        <button
          onClick={() => onRemoveComments("html")}
          className={`${mobileBtn} border border-anthro-blue/40 bg-white dark:bg-anthro-surface text-anthro-blue hover:bg-anthro-blue-subtle dark:hover:bg-anthro-blue/10`}
        >
          <FileCode size={14} />
          <span>{t("removeHtmlComments")}</span>
        </button>

        {/* Remove JS comments */}
        <button
          onClick={() => onRemoveComments("js")}
          className={`${mobileBtn} border border-anthro-blue/40 bg-white dark:bg-anthro-surface text-anthro-blue hover:bg-anthro-blue-subtle dark:hover:bg-anthro-blue/10`}
        >
          <FileCode2 size={14} />
          <span>{t("removeJsComments")}</span>
        </button>

        {/* Compare */}
        <button
          onClick={onCompare}
          className={`${mobileBtn} border border-anthro-blue/40 bg-white dark:bg-anthro-surface text-anthro-blue hover:bg-anthro-blue-subtle dark:hover:bg-anthro-blue/10`}
        >
          <GitCompare size={14} />
          <span>{t("compareCode")}</span>
        </button>

        {/* Clear All */}
        <button
          onClick={onClearAll}
          className={`${mobileBtn} border border-anthro-border dark:border-anthro-dark-border bg-white dark:bg-anthro-surface text-anthro-mid hover:text-red-500 hover:border-red-200 dark:hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10`}
        >
          <Eraser size={14} />
          <span>{t("clearAll")}</span>
        </button>
      </div>

      {/* ── DESKTOP layout: vertical column ── */}
      <div className="hidden md:flex flex-col gap-2 w-44 shrink-0 pt-6 justify-start">
        {/* Format Code */}
        <button
          onClick={onFormat}
          disabled={isFormatting}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#007AFF] hover:bg-[#0066CC] text-white text-sm font-semibold font-heading transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isFormatting ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
          <span>{isFormatting ? t("formatting") : t("formatCode")}</span>
        </button>

        {/* Remove Comments dropdown */}
        <div className="relative">
          <button
            onMouseEnter={() => setUncommentOpen(true)}
            onMouseLeave={() => setUncommentOpen(false)}
            className={`${desktopSecondary} border-anthro-blue/40 dark:border-anthro-blue/30 bg-white dark:bg-anthro-surface text-anthro-blue hover:bg-anthro-blue-subtle dark:hover:bg-anthro-blue/10 justify-center gap-2`}
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
                onClick={() => { onRemoveComments("html"); setUncommentOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-heading text-anthro-dark dark:text-anthro-light hover:bg-anthro-border dark:hover:bg-anthro-dark-border transition-colors"
              >
                <FileCode size={14} className="text-anthro-mid shrink-0" />
                {t("removeHtmlComments")}
              </button>
              <button
                onClick={() => { onRemoveComments("js"); setUncommentOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-heading text-anthro-dark dark:text-anthro-light hover:bg-anthro-border dark:hover:bg-anthro-dark-border transition-colors"
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
          className={`${desktopSecondary} border-anthro-blue/40 dark:border-anthro-blue/30 bg-white dark:bg-anthro-surface text-anthro-blue hover:bg-anthro-blue-subtle dark:hover:bg-anthro-blue/10`}
        >
          <GitCompare size={15} />
          <span>{t("compareCode")}</span>
        </button>

        {/* Clear All */}
        <button
          onClick={onClearAll}
          className={`${desktopSecondary} border-anthro-border dark:border-anthro-dark-border bg-white dark:bg-anthro-surface text-anthro-mid hover:text-red-500 hover:border-red-200 dark:hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10`}
        >
          <Eraser size={15} />
          <span>{t("clearAll")}</span>
        </button>
      </div>
    </>
  );
}
