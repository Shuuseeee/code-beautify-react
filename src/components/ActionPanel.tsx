"use client";

import { useState } from "react";
import { Wand2, GitCompare, Eraser, ChevronDown, FileCode, FileCode2, MessageSquareX } from "lucide-react";
import { useI18n } from "@/i18n/context";

interface ActionPanelProps {
  onFormat: () => void;
  onCompare: () => void;
  onClearAll: () => void;
  onRemoveComments: (type: "html" | "js") => void;
}

export default function ActionPanel({
  onFormat,
  onCompare,
  onClearAll,
  onRemoveComments,
}: ActionPanelProps) {
  const { t } = useI18n();
  const [uncommentOpen, setUncommentOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 w-44 shrink-0 py-2 justify-center">
      {/* Format Code — primary CTA */}
      <button
        onClick={onFormat}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#007AFF] hover:bg-[#0066CC] text-white text-sm font-semibold font-heading transition-colors shadow-sm"
      >
        <Wand2 size={15} />
        <span>{t("formatCode")}</span>
      </button>

      {/* Remove Comments dropdown */}
      <div className="relative">
        <button
          onMouseEnter={() => setUncommentOpen(true)}
          onMouseLeave={() => setUncommentOpen(false)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-anthro-blue/40 dark:border-anthro-blue/30 bg-white dark:bg-anthro-surface text-anthro-blue text-sm font-medium font-heading hover:bg-anthro-blue-subtle dark:hover:bg-anthro-blue/10 transition-colors"
        >
          <MessageSquareX size={15} />
          <span>{t("removeComments")}</span>
          <ChevronDown size={12} className="opacity-60" />
        </button>
        {uncommentOpen && (
          <div
            onMouseEnter={() => setUncommentOpen(true)}
            onMouseLeave={() => setUncommentOpen(false)}
            className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-anthro-surface border border-anthro-border dark:border-anthro-dark-border rounded-xl shadow-lg overflow-hidden z-20"
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
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-anthro-blue/40 dark:border-anthro-blue/30 bg-white dark:bg-anthro-surface text-anthro-blue text-sm font-medium font-heading hover:bg-anthro-blue-subtle dark:hover:bg-anthro-blue/10 transition-colors"
      >
        <GitCompare size={15} />
        <span>{t("compareCode")}</span>
      </button>

      {/* Clear All */}
      <button
        onClick={onClearAll}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-anthro-border dark:border-anthro-dark-border bg-white dark:bg-anthro-surface text-anthro-mid hover:text-red-500 hover:border-red-200 dark:hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-medium font-heading transition-colors"
      >
        <Eraser size={15} />
        <span>{t("clearAll")}</span>
      </button>
    </div>
  );
}
