"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/i18n/context";
import dynamic from "next/dynamic";
import type { Theme } from "@/hooks/useTheme";
import { registerServiceNowLanguage, isServiceNowCode } from "@/lib/monacoServiceNow";

const MonacoDiffEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.DiffEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center text-anthro-mid text-sm font-heading">
        Loading editor...
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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isSnow = isServiceNowCode(original) || isServiceNowCode(modified);
  const monacoLang = isSnow
    ? "servicenow"
    : language === "html" ? "html"
    : language === "css"  ? "css"
    : language === "json" ? "json"
    : "javascript";
  const monacoTheme = isSnow
    ? (theme === "dark" ? "servicenow-dark" : "servicenow-light")
    : (theme === "dark" ? "vs-dark" : "vs");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-anthro-dark/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-anthro-surface border border-anthro-border dark:border-anthro-dark-border rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden"
        style={{ maxWidth: "min(96vw, 1600px)", height: "calc(100vh - 3rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-anthro-border dark:border-anthro-dark-border">
          <h2 className="font-semibold font-heading text-anthro-dark dark:text-anthro-light">
            {t("compareModalTitle")}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-anthro-mid hover:text-anthro-dark hover:bg-anthro-border dark:hover:text-anthro-light dark:hover:bg-anthro-dark-border transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Monaco diff editor — theme driven by prop from parent */}
        <div className="flex-1 min-h-0">
          <MonacoDiffEditor
            original={original}
            modified={modified}
            language={monacoLang}
            theme={monacoTheme}
            beforeMount={(monaco) => registerServiceNowLanguage(monaco)}
            options={{ readOnly: true, automaticLayout: true, fontSize: 13 }}
            height="100%"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-anthro-border dark:border-anthro-dark-border">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold font-heading bg-[#007AFF] hover:bg-[#0066CC] text-white rounded-lg transition-colors"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
