"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Trash2 } from "lucide-react";
import { useI18n } from "@/i18n/context";

interface CodePanelProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  onClear: () => void;
  readOnly?: boolean;
  placeholder?: string;
  onInput?: (value: string) => void;
}

export default function CodePanel({
  label,
  value,
  onChange,
  onClear,
  readOnly = false,
  placeholder,
  onInput,
}: CodePanelProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-anthro-surface border border-anthro-border dark:border-anthro-dark-border rounded-xl overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-anthro-border dark:border-anthro-dark-border select-none">
        <span className="text-[10px] font-semibold font-heading uppercase tracking-widest text-anthro-mid">
          {label}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleCopy}
            title={t("copy")}
            className="p-1.5 rounded-lg text-anthro-mid hover:text-anthro-orange hover:bg-anthro-orange-subtle dark:hover:bg-anthro-orange/10 transition-colors"
          >
            {copied ? (
              <Check size={14} className="text-anthro-green" />
            ) : (
              <Copy size={14} />
            )}
          </button>
          <button
            onClick={onClear}
            title={t("clear")}
            className="p-1.5 rounded-lg text-anthro-mid hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => {
          onChange?.(e.target.value);
          onInput?.(e.target.value);
        }}
        readOnly={readOnly}
        placeholder={placeholder}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className="flex-1 w-full p-4 resize-none text-sm bg-transparent text-anthro-dark dark:text-anthro-light placeholder:text-anthro-mid/50 focus:outline-none leading-relaxed"
      />
    </div>
  );
}
